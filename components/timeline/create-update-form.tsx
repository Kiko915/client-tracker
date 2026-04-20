"use client";

import { useState } from "react";
import { createUpdateAction } from "@/app/actions";
import { enhanceNotesAction } from "@/app/ai-actions";
import { PendingSubmitButton } from "@/components/form/pending-submit-button";

export function CreateUpdateForm({
  projectId,
  projectName,
  clientName,
}: {
  projectId: string;
  projectName: string;
  clientName: string;
}) {
  const [titleValue, setTitleValue] = useState("");
  const [body, setBody] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);

  async function handleEnhance() {
    setIsEnhancing(true);
    try {
      const result = await enhanceNotesAction({
        title: titleValue,
        body,
        projectName,
        clientName,
      });
      setBody(result);
    } catch (e) {
      console.error("Enhance failed:", e);
    } finally {
      setIsEnhancing(false);
    }
  }

  return (
    <section className="card stack">
      <h2 className="section-title">Add Timeline Update</h2>
      <form
        className="stack"
        encType="multipart/form-data"
        action={async (formData) => {
          await createUpdateAction(projectId, formData);
          setTitleValue("");
          setBody("");
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
              required
            />
          </label>
          <label className="label">
            Date &amp; Time
            <input
              className="input"
              name="created_at"
              type="datetime-local"
              defaultValue={new Date().toISOString().slice(0, 16)}
            />
          </label>
          <label className="label full-span">
            Images (optional)
            <input
              className="input"
              name="timeline_images"
              type="file"
              accept="image/*"
              multiple
            />
          </label>
          <label className="label full-span">
            Videos (optional)
            <input
              className="input"
              name="timeline_videos"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              multiple
            />
          </label>
          <label className="label full-span">
            Documents (optional)
            <input
              className="input"
              name="timeline_documents"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
            />
          </label>
        </div>
        <PendingSubmitButton
          idleLabel="Save Update"
          pendingLabel="Saving Update..."
        />
      </form>
    </section>
  );
}
