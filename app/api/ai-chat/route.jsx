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
      model: "llama-3.1-8b-instant", // ✅ FREE & ACTIVE
      messages: [
        {
          role: "user",
          content: prompt, // 👈 frontend-controlled prompt
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    return NextResponse.json({
      result: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Groq Error:", error);

    return NextResponse.json(
      { error: error.message || "Groq API error" },
      { status: 500 }
    );
  }
}
