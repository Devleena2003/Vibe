import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 4096,
    });

    let text = completion.choices[0].message.content;

    // 1️⃣ Remove markdown fences
    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // 2️⃣ Extract JSON block
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error("No JSON found in AI response");
    }
    text = text.slice(start, end + 1);

    // 3️⃣ Extract code blocks safely
    const codeBlocks = [];
    text = text.replace(
      /"code"\s*:\s*([\s\S]*?)(?=,\s*"[a-zA-Z]|}\s*})/g,
      (match, code) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(code.trim());
        return `"code": "${placeholder}"`;
      }
    );

    // 4️⃣ Parse JSON structure safely
    const parsed = JSON.parse(text);

    // 5️⃣ Restore code blocks
    Object.values(parsed.files || {}).forEach((file, i) => {
      if (file.code?.includes("__CODE_BLOCK_")) {
        const index = Number(file.code.match(/\d+/)[0]);
        file.code = codeBlocks[index]
          .replace(/^["`]/, "")
          .replace(/["`]$/, "")
          .replace(/\\n/g, "\n");
      }
    });

    if (!parsed.files) {
      throw new Error("Parsed JSON missing files");
    }

    return NextResponse.json({
      projectTitle: parsed.projectTitle || "AI Generated Project",
      explanation: parsed.explanation || "",
      files: parsed.files,
      generatedFiles: parsed.generatedFiles || Object.keys(parsed.files),
    });
  } catch (error) {
    console.error("GROQ CODE GEN ERROR:", error);

    return NextResponse.json(
      {
        projectTitle: "Error",
        explanation: "Failed to generate project",
        files: {},
        generatedFiles: [],
        error: error.message,
      },
      { status: 500 }
    );
  }
}
