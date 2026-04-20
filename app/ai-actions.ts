"use server";

import Groq from "groq-sdk";
import { isRateLimited } from "@/lib/rate-limit";

export async function enhanceNotesAction(params: {
  title: string;
  body: string;
  projectName: string;
  clientName: string;
}): Promise<string> {
  if (isRateLimited("ai-enhance", 20, 60_000)) {
    throw new Error("Too many enhance requests. Please wait a moment.");
  }

  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = params.body.trim()
    ? `Polish the following project update note into clear, concise, client-facing prose. Return only the improved text, no preamble.\n\nTitle: ${params.title}\nNotes: ${params.body}`
    : `Write a short, professional project update note for a client-facing tracker.\n\nProject: ${params.projectName}\nClient: ${params.clientName}\nUpdate title: ${params.title}\n\nReturn only the note text, no preamble.`;

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("Unexpected AI response.");
  return text.trim();
}
