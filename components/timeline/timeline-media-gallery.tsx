"use client";

import { useState } from "react";
import type { TimelineMediaItem } from "@/lib/types";

export function TimelineMediaGallery({ media }: { media: TimelineMediaItem[] }) {
  const [selectedMedia, setSelectedMedia] = useState<TimelineMediaItem | null>(null);

  if (!media || media.length === 0) return null;

  return (
    <>
      <div className="timeline-media-grid">
        {media.map((m, index) =>
          m.type === "image" ? (
            <button
              key={`${m.url}-${index}`}
              className="timeline-media-item timeline-media-image"
              onClick={() => setSelectedMedia(m)}
              type="button"
              style={{ cursor: "pointer", border: "none", padding: 0, background: "none", textAlign: "left" }}
            >
              <img src={m.url} alt="" className="timeline-media-img" loading="lazy" />
            </button>
          ) : (
            <div key={`${m.url}-${index}`} className="timeline-media-item timeline-media-image">
              <button
                onClick={() => setSelectedMedia(m)}
                type="button"
                style={{ cursor: "pointer", border: "none", padding: 0, background: "none", width: "100%", height: "100%", position: "relative" }}
              >
                <video
                  className="timeline-media-video"
                  src={m.url}
                  preload="metadata"
                  style={{ pointerEvents: "none" }}
                />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: "var(--radius-md)"
                }}>
                  <span style={{
                    background: "rgba(255,255,255,0.8)",
                    color: "#000",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontWeight: "bold",
                    fontSize: "12px"
                  }}>
                    ▶ Play
                  </span>
                </div>
              </button>
            </div>
          )
        )}
      </div>

      {selectedMedia && (
        <div
          onClick={() => setSelectedMedia(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "2rem",
            backdropFilter: "blur(4px)"
          }}
        >
          <button
            onClick={() => setSelectedMedia(null)}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "rgba(255, 255, 255, 0.15)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontSize: "24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s"
            }}
            aria-label="Close modal"
          >
            &times;
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "100%", display: "flex", justifyContent: "center" }}
          >
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt=""
                style={{
                  maxWidth: "100%",
                  maxHeight: "90vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                playsInline
                style={{
                  maxWidth: "100%",
                  maxHeight: "90vh",
                  borderRadius: "8px",
                  outline: "none",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}
              >
                Your browser does not support embedded video.
              </video>
            )}
          </div>
        </div>
      )}
    </>
  );
}
