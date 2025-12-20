"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import Lookup from "@/data/Lookup";
import { MessageContext } from "@/context/MessageContext";
import axios from "axios";
import Prompt from "../../data/Prompt";
import { useParams } from "next/navigation";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function CodeView() {
  const { id } = useParams(); // workspaceId
  const convex = useConvex();

  const [activeTab, setActiveTab] = useState("code");
  const [files, setFiles] = useState(Lookup?.DEFAULT_FILE);
  const { messages, setMessages } = useContext(MessageContext);
  const [dependencies, setDependencies] = useState({});
  const updateFiles = useMutation(api.workspace.UpdateFiles);
  useEffect(() => {
    id && GetWorkspaceFiles();
  }, [id]);

  const GetWorkspaceFiles = async () => {
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceId: id,
    });

    if (result?.fileData) {
      setFiles(result.fileData);
    }
  };

  useEffect(() => {
    if (messages?.length > 0) {
      const role = messages[messages?.length - 1].role;
      if (role == "user") {
        GenerativeAiCode();
      }
    }
  }, [messages]);
  const GenerativeAiCode = async () => {
    const PROMPT =
      messages[messages?.length - 1].content + " " + Prompt.CODE_GEN_PROMPT;
    const result = await axios.post("/api/gen-ai-code", {
      prompt: PROMPT,
    });
    console.log(result.data);
    const aiResp = result.data;

    const mergedFiles = { ...Lookup.DEFAULT_FILE, ...aiResp?.files };

    setFiles(mergedFiles);
    await updateFiles({
      workspaceId: id, // you must already have this
      files: mergedFiles,
    });

    if (aiResp.dependencies) {
      setDependencies(aiResp.dependencies);
    }
  };
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async () => {
    if (deploying) return;

    try {
      setDeploying(true);

      const res = await axios.post("/api/deploy", {
        files,
        repoName: `ai-project-${Date.now()}`,
      });

      alert("🚀 Deployed successfully!");
      console.log(res.data);
      const { liveUrl } = res.data;

      if (liveUrl) {
        // 🚀 Redirect to live site
        window.open(liveUrl, "_blank");
      } else {
        alert("Deployment succeeded but no live URL returned.");
      }
    } catch (err) {
      console.error(err?.response?.data || err.message);
      alert("Deployment failed");
    } finally {
      setDeploying(false);
    }
  };
  const handleExport = async () => {
    try {
      const response = await axios.post(
        "/api/export",
        { files },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/zip",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "project.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export project");
    }
  };

  return (
    <div>
      <div className="bg-[#181818] w-full p-2 border">
        <div className="flex justify-center items-center flex-wrap shrink-0 bg-black p-1 w-[140px] gap-3  rounded-full">
          <h2
            onClick={() => setActiveTab("code")}
            className={`text-sm cursor-pointer ${activeTab === "code" && "text-blue-500 bg-gray-800 p-1 px-2 rounded-full"}`}
          >
            Code
          </h2>
          <h2
            onClick={() => setActiveTab("preview")}
            className={`text-sm cursor-pointer  ${activeTab === "preview" && "text-blue-500 bg-gray-800 p-1 px-2 rounded-full"}`}
          >
            Preview
          </h2>
        </div>
        <button
          onClick={handleDeploy}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Deploy
        </button>
        <button
          onClick={handleExport}
          className="bg-green-500 text-white p-2 rounded"
        >
          Export
        </button>
      </div>

      <SandpackProvider
        files={files}
        template="react"
        theme={"dark"}
        customSetup={{
          dependencies: {
            ...Lookup.DEPENDENCY,
            ...dependencies,
          },
        }}
        options={{
          externalResources: [
            "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",
          ],
        }}
      >
        <SandpackLayout>
          {activeTab == "code" ? (
            <>
              <SandpackFileExplorer style={{ height: "80vh" }} />
              <SandpackCodeEditor style={{ height: "80vh" }} />
            </>
          ) : (
            <>
              <SandpackPreview
                style={{ height: "80vh" }}
                showNavigator={true}
              />{" "}
            </>
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
export default CodeView;
