"use client";

import { useState } from "react";
import { updateUpdateAction, deleteUpdateAction } from "@/app/actions";
import { enhanceNotesAction } from "@/app/ai-actions";
import { PendingSubmitButton } from "@/components/form/pending-submit-button";
import type { ProjectUpdate } from "@/lib/types";

export function UpdateControls({
  item,
  projectId,
  projectName,
  clientName,
}: {
  item: ProjectUpdate;
  projectId: string;
  projectName?: string;
  clientName?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [titleValue, setTitleValue] = useState(item.title);
  const [body, setBody] = useState(item.body);
  const [isEnhancing, setIsEnhancing] = useState(false);

  async function handleEnhance() {
    setIsEnhancing(true);
    try {
      const result = await enhanceNotesAction({
        title: titleValue,
        body,
        projectName: projectName ?? "",
        clientName: clientName ?? "",
      });
      setBody(result);
    } catch (e) {
      console.error("Enhance failed:", e);
    } finally {
      setIsEnhancing(false);
    }
  }

  if (isEditing) {
    return (
      <div
        className="card stack"
        style={{
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: "var(--card-bg-alt, rgba(0,0,0,0.02))",
        }}
      >
        <h3 className="section-title" style={{ fontSize: "14px" }}>
          Edit Update
        </h3>
        <form
          className="stack"
          encType="multipart/form-data"
          action={async (formData) => {
            await updateUpdateAction(item.id, projectId, formData);
            setIsEditing(false);
          }}
        >
          <div className="form-grid">
            <label className="label full-span">
              Title
              <input
                className="input"
                name="title"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                required
              />
            </label>
            <label className="label full-span">
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <span>Notes</span>
                <button
                  className="btn secondary compact"
                  type="button"
                  disabled={isEnhancing || !titleValue.trim()}
                  onClick={handleEnhance}
                >
                  {isEnhancing ? "Enhancing..." : "✨ Enhance"}
                </button>
              </div>
              <textarea
                className="textarea"
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </label>
            <label className="label">
              Progress %
              <input
                className="input"
                min={0}
                max={100}
                name="progress_percent"
                type="number"
                defaultValue={item.progress_percent}
                required
              />
            </label>
            <label className="label">
              Date &amp; Time
              <input
                className="input"
                name="created_at"
                type="datetime-local"
                defaultValue={item.created_at.slice(0, 16)}
              />
            </label>
            <label className="label full-span">
              Images (optional, overwrites current)
              <input
                className="input"
                name="timeline_images"
                type="file"
                accept="image/*"
                multiple
              />
            </label>
            <label className="label full-span">
              Videos (optional, overwrites current)
              <input
                className="input"
                name="timeline_videos"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                multiple
              />
            </label>
            <label className="label full-span">
              Documents (optional, overwrites current)
              <input
                className="input"
                name="timeline_documents"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
              />
            </label>
          </div>
          <div className="row" style={{ marginTop: "1rem" }}>
            <PendingSubmitButton
              idleLabel="Save Changes"
              pendingLabel="Saving Changes..."
            />
            <button
              className="btn secondary"
              type="button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="row" style={{ marginTop: "1rem" }}>
      <button
        className="btn secondary compact"
        type="button"
        onClick={() => setIsEditing(true)}
      >
        Edit
      </button>

      <button
        className={`btn compact danger ${isDeleting ? "confirm" : ""}`}
        type="button"
        disabled={isDeletePending}
        onClick={async () => {
          if (isDeleting) {
            setIsDeletePending(true);
            try {
              await deleteUpdateAction(item.id);
            } finally {
              setIsDeletePending(false);
            }
          } else {
            setIsDeleting(true);
            setTimeout(() => setIsDeleting(false), 3000);
          }
        }}
      >
        {isDeletePending
          ? "Deleting..."
          : isDeleting
            ? "Confirm Delete"
            : "Delete"}
      </button>
    </div>
  );
}
