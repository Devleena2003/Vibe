import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a specialized code generator that output ONLY raw JSON. Ensure all keys and string values use double quotes.  Do NOT use /src folders. Place all files and folders at the root level. Your entry point MUST be /main.js. Never use single quotes for JSON keys.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 8000, // Increased to prevent truncation
    });

    let text = completion.choices[0].message.content;

    // --- 1. EXTRACT JSON BLOCK ---
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON found");
    let jsonString = text.slice(start, end + 1);

    // --- 2. THE "POSITION 1" REPAIR ENGINE ---
    // This fixes { key: "val" } and { 'key': "val" } into { "key": "val" }
    let cleaned = jsonString
      // Fix unquoted keys (Position 1 error)
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
      // Fix single-quoted keys
      .replace(/([{,]\s*)'([a-zA-Z0-9_]+)'\s*:/g, '$1"$2":')
      // Remove trailing commas before closing braces/brackets
      .replace(/,\s*([\]}])/g, "$1")
      // Clean control characters that break JSON.parse
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // Fallback: If AI included literal newlines in code strings, escape them
      const escaped = cleaned.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
      // Double check we didn't break the structure
      const reStructured = escaped
        .replace(/"\s*:\\n\s*"/g, '": "')
        .replace(/"\s*\\n\s*}/g, '"}');
      parsed = JSON.parse(reStructured);
    }

    // --- 3. ENFORCE SANDPACK FS STRUCTURE ---
    const finalFiles = {};
    const rawFiles = parsed.files || {};

    Object.keys(rawFiles).forEach((path) => {
      let code = "";
      if (typeof rawFiles[path] === "string") {
        code = rawFiles[path];
      } else if (rawFiles[path] && typeof rawFiles[path].code === "string") {
        code = rawFiles[path].code;
      }
      let rootPath = path.replace(/^\/src\//, "/").replace(/^src\//, "/");

      if (!rootPath.startsWith("/")) rootPath = "/" + rootPath;

      finalFiles[rootPath] = { code };
    });

    // Mandatory Entry Point for React Template
    // Mandatory Entry Point at Root
    if (!finalFiles["/main.js"]) {
      // If AI generated index.js instead, move it to main.js
      if (finalFiles["/index.js"]) {
        finalFiles["/main.js"] = finalFiles["/index.js"];
        delete finalFiles["/index.js"];
      } else {
        finalFiles["/main.js"] = {
          code: `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\nconst root = createRoot(document.getElementById('root'));\nroot.render(<App />);`,
        };
      }
    }

    return NextResponse.json({
      projectTitle: parsed.projectTitle || "Generated Project",
      explanation: parsed.explanation || "",
      files: finalFiles,
      generatedFiles: Object.keys(finalFiles),
    });
  } catch (error) {
    console.error("GROQ_CLEAN_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
