import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { files, repoName } = await req.json();

    if (!files || !repoName) {
      return NextResponse.json(
        { error: "files and repoName are required" },
        { status: 400 }
      );
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

    /* -------------------- 1️⃣ CREATE GITHUB REPO -------------------- */

    const repoRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: repoName,
        private: false,
        auto_init: true,
      }),
    });

    if (!repoRes.ok && repoRes.status !== 422) {
      const err = await repoRes.text();
      throw new Error("Repo creation failed: " + err);
    }

    /* -------------------- 2️⃣ PUSH FILES -------------------- */

    for (const path in files) {
      const content = files[path]?.code;
      if (!content) continue;

      const cleanPath = path.replace(/^\//, "");

      await fetch(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/${cleanPath}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Add ${cleanPath}`,
            content: Buffer.from(content).toString("base64"),
          }),
        }
      );
    }

    /* -------------------- 3️⃣ CREATE VERCEL PROJECT -------------------- */
    /* ⚠️ THIS AUTOMATICALLY TRIGGERS DEPLOYMENT */

    const vercelRes = await fetch("https://api.vercel.com/v10/projects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: repoName,
        gitRepository: {
          type: "github",
          repo: `${GITHUB_USERNAME}/${repoName}`,
        },
        framework: "vite",
      }),
    });

    const vercelProject = await vercelRes.json();

    if (!vercelRes.ok) {
      throw new Error(
        "Vercel project creation failed: " + JSON.stringify(vercelProject)
      );
    }

    /* -------------------- 4️⃣ RETURN URL -------------------- */

    return NextResponse.json({
      success: true,
      repoUrl: `https://github.com/${GITHUB_USERNAME}/${repoName}`,
      liveUrl: `https://${repoName}.vercel.app`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
