"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/validators/project";
import { createUpdateSchema } from "@/lib/validators/update";
import { createAdminClient, createClient } from "@/lib/supabase/server";

function getFileExtension(file: File) {
  const byMime: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/gif": "gif",
  };
  return byMime[file.type] ?? "bin";
}

function getMediaExtension(file: File) {
  const byMime: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };
  return byMime[file.type] ?? "bin";
}

function collectDataFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

async function uploadTimelineMedia(
  projectId: string,
  imageFiles: File[],
  videoFiles: File[],
) {
  const admin = createAdminClient();
  const items: { type: "image" | "video"; url: string }[] = [];

  for (const file of imageFiles) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Timeline images must be image files.");
    }
    const ext = getMediaExtension(file);
    const path = `${projectId}/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage
      .from("timeline-media")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });
    if (error) {
      throw new Error(error.message);
    }
    const { data } = admin.storage.from("timeline-media").getPublicUrl(path);
    items.push({ type: "image", url: data.publicUrl });
  }

  for (const file of videoFiles) {
    if (!file.type.startsWith("video/")) {
      throw new Error("Timeline videos must be video files.");
    }
    const ext = getMediaExtension(file);
    const path = `${projectId}/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage
      .from("timeline-media")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });
    if (error) {
      throw new Error(error.message);
    }
    const { data } = admin.storage.from("timeline-media").getPublicUrl(path);
    items.push({ type: "video", url: data.publicUrl });
  }

  return items;
}

async function uploadCompanyLogo(
  fileEntry: FormDataEntryValue | null,
  slug: string,
) {
  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    return null;
  }

  if (!fileEntry.type.startsWith("image/")) {
    throw new Error("Company logo must be an image file.");
  }

  const ext = getFileExtension(fileEntry);
  const path = `${slug}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await fileEntry.arrayBuffer());
  const admin = createAdminClient();

  const { error } = await admin.storage
    .from("company-logos")
    .upload(path, buffer, {
      contentType: fileEntry.type,
      upsert: false,
    });
  if (error) {
    throw new Error(error.message);
  }

  const { data } = admin.storage.from("company-logos").getPublicUrl(path);
  return data.publicUrl;
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message);
  }
  redirect("/admin/projects");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function createProjectAction(formData: FormData) {
  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    client_name: formData.get("client_name"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid project payload.",
    );
  }

  const supabase = await createClient();
  const companyLogoUrl = await uploadCompanyLogo(
    formData.get("company_logo_file"),
    parsed.data.slug,
  );
  const payload = {
    ...parsed.data,
    company_logo_url: companyLogoUrl,
    share_token: randomUUID(),
  };
  const { error } = await supabase.from("projects").insert(payload);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/projects");
}

export async function updateProjectAction(
  projectId: string,
  formData: FormData,
) {
  const parsed = updateProjectSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    client_name: formData.get("client_name"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid project payload.",
    );
  }

  const supabase = await createClient();
  const companyLogoUrl = await uploadCompanyLogo(
    formData.get("company_logo_file"),
    parsed.data.slug,
  );
  const updatePayload: Record<string, unknown> = { ...parsed.data };
  if (companyLogoUrl) {
    updatePayload.company_logo_url = companyLogoUrl;
  }
  if (formData.get("remove_company_logo") === "on") {
    updatePayload.company_logo_url = null;
  }

  const { error } = await supabase
    .from("projects")
    .update(updatePayload)
    .eq("id", projectId);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${parsed.data.slug}`);
}

export async function createUpdateAction(
  projectId: string,
  formData: FormData,
) {
  const parsed = createUpdateSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    progress_percent: formData.get("progress_percent"),
  });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid update payload.",
    );
  }

  const imageFiles = collectDataFiles(formData, "timeline_images");
  const videoFiles = collectDataFiles(formData, "timeline_videos");
  const media = await uploadTimelineMedia(projectId, imageFiles, videoFiles);
  const firstImageUrl = media.find((m) => m.type === "image")?.url ?? null;

  const supabase = await createClient();
  const { error } = await supabase.from("project_updates").insert({
    project_id: projectId,
    ...parsed.data,
    media,
    image_url: firstImageUrl,
  });
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/projects");
}

export async function updateUpdateAction(
  updateId: string,
  projectId: string,
  formData: FormData,
) {
  const parsed = createUpdateSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    progress_percent: formData.get("progress_percent"),
  });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid update payload.",
    );
  }

  const supabase = await createClient();
  const updatePayload: Record<string, unknown> = { ...parsed.data };

  const imageFiles = collectDataFiles(formData, "timeline_images");
  const videoFiles = collectDataFiles(formData, "timeline_videos");

  if (imageFiles.length > 0 || videoFiles.length > 0) {
    const media = await uploadTimelineMedia(projectId, imageFiles, videoFiles);
    const firstImageUrl = media.find((m) => m.type === "image")?.url ?? null;
    updatePayload.media = media;
    updatePayload.image_url = firstImageUrl;
  }

  const { error } = await supabase
    .from("project_updates")
    .update(updatePayload)
    .eq("id", updateId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/projects");
}

export async function deleteUpdateAction(updateId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_updates")
    .delete()
    .eq("id", updateId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/projects");
}
