import { NextResponse } from "next/server";
import OpenAI from "openai";
import Prompt from "@/data/Prompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 8000,
      messages: [
        {
          role: "system",
          content:
            Prompt.CODE_GEN_PROMPT +
            "\n\nIMPORTANT: Return ONLY valid JSON. You MUST create a /package.json file that lists all dependencies used in the project. Do not add markdown, comments, or explanations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    let text = completion.choices[0].message.content;

    // --- 1. EXTRACT JSON BLOCK SAFELY ---
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in model response");
    }

    let jsonString = text.slice(firstBrace, lastBrace + 1);

    // --- 2. MINIMAL, SAFE CLEANUP ---
    jsonString = jsonString
      // remove trailing commas
      .replace(/,\s*([\]}])/g, "$1")
      // remove invalid control chars
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      // Fallback: escape raw newlines inside strings
      const escaped = jsonString.replace(/\r/g, "\\r").replace(/\n/g, "\\n");
      parsed = JSON.parse(escaped);
    }

    // --- 3. NORMALIZE FILE STRUCTURE ---
    const finalFiles = {};
    const rawFiles = parsed.files || {};
    const detectedDeps = {};

    let packageJson = null;
    if (rawFiles["/package.json"]) {
      try {
        packageJson = JSON.parse(rawFiles["/package.json"].code);
        Object.assign(detectedDeps, packageJson.dependencies); // Merge deps
      } catch (e) {
        console.warn("Invalid package.json:", e.message);
      }
    }
    Object.entries(rawFiles).forEach(([path, value]) => {
      const code =
        typeof value === "string"
          ? value
          : typeof value?.code === "string"
            ? value.code
            : "";

      let rootPath = path.replace(/^\/?src\//, "/");
      if (!rootPath.startsWith("/")) rootPath = "/" + rootPath;

      finalFiles[rootPath] = { code };
    });

    // --- 4. ENSURE ENTRY POINT ---
    if (!finalFiles["/main.js"]) {
      if (finalFiles["/index.js"]) {
        finalFiles["/main.js"] = finalFiles["/index.js"];
        delete finalFiles["/index.js"];
      } else {
        finalFiles["/main.js"] = {
          code: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
`,
        };
      }
    }

    return NextResponse.json({
      projectTitle: parsed.projectTitle || "Generated Project",
      explanation: parsed.explanation || "",
      files: finalFiles,
      dependencies: detectedDeps, // Send dependencies
      generatedFiles: Object.keys(finalFiles),
    });
  } catch (error) {
    console.error("OPENAI_CODEGEN_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
