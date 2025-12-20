import { NextResponse } from "next/server";
import JSZip from "jszip";

export async function POST(req) {
  try {
    const { files } = await req.json();

    const zip = new JSZip();

    for (const filePath in files) {
      if (!files[filePath]?.code) continue;

      // Remove leading slash
      const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;

      const parts = cleanPath.split("/");

      // If file is nested, create folders
      if (parts.length > 1) {
        let folder = zip;
        for (let i = 0; i < parts.length - 1; i++) {
          folder = folder.folder(parts[i]);
        }
        folder.file(parts[parts.length - 1], files[filePath].code);
      } else {
        // Root-level file
        zip.file(cleanPath, files[filePath].code);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="project.zip"',
      },
    });
  } catch (error) {
    console.error("ZIP error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
