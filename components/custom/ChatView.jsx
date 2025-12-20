"use client";
import { useConvex } from "convex/react";
import { useParams } from "next/navigation";
import React, { useContext } from "react";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import Colors from "@/data/Colors";
import { MessageContext } from "@/context/MessageContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import Image from "next/image";
import Lookup from "@/data/Lookup";
import { ArrowRight, Link, Loader2Icon } from "lucide-react";
import axios from "axios";
import Prompt from "@/data/Prompt";
import { useMutation } from "convex/react";
import { useSidebar } from "../ui/sidebar";
function ChatView() {
  const { id } = useParams();
  const convex = useConvex();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { messages, setMessages } = useContext(MessageContext);
  const [input, setUserInput] = useState();
  const [loading, setLoading] = useState(false);
  const UpdateMessages = useMutation(api.workspace.UpdateMessages);
  const { toggleSidebar } = useSidebar();
  useEffect(() => {
    id && GetWorkspaceData();
  }, [id]);

  const GetWorkspaceData = async () => {
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceId: id,
    });
    console.log(result);
    setMessages(result?.messages);
  };
  useEffect(() => {
    if (messages?.length > 0) {
      const role = messages[messages?.length - 1].role;
      if (role == "user") {
        GetAiResponse();
      }
    }
  }, [messages]);
  const GetAiResponse = async () => {
    setLoading(true);
    const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT;
    const result = await axios.post("/api/ai-chat", {
      prompt: PROMPT,
    });
    console.log(result.data.result);
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content: result.data.result,
      },
    ]);
    await UpdateMessages({
      messages: [...messages, { role: "ai", content: result.data.result }],
      workspaceId: id,
    });
    setLoading(false);
  };
  const onGenerate = (input) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: input,
      },
    ]);
    setUserInput("");
  };
  return (
    <div className="relative h-[85vh] flex flex-col">
      <div className="flex-1 overflow-y-scroll hide-scrollbar pl-5">
        {messages?.map((msg, index) => (
          <div
            className="p-3 rounded-lg mb-2 flex gap-2 items-center leading-7"
            key={index}
            style={{ backgroundColor: Colors.CHAT_BACKGROUND }}
          >
            {msg?.role == "user" && (
              <Image
                src={userDetail?.picture}
                alt="userImage"
                width={35}
                height={35}
                className="rounded-full cursor-pointer"
              />
            )}
            <h2>{msg.content}</h2>
          </div>
        ))}
        {loading && (
          <div
            className="p-3 rounded-lg mb-2 flex gap-2 items-center "
            style={{ backgroundColor: Colors.CHAT_BACKGROUND }}
          >
            <Loader2Icon className="animate-spin" />
            <h2>Generating response...</h2>
          </div>
        )}
      </div>
      <div className="flex gap-2 items-end">
        {userDetail && (
          <Image
            src={userDetail?.picture}
            alt="userImage"
            width={30}
            height={30}
            className="rounded-full"
            onClick={toggleSidebar}
          />
        )}
        <div className="p-5 border rounded-xl max-w-2xl w-full mt-3">
          <div className="flex gap-2">
            <textarea
              value={input}
              className="outline-none bg-transperant w-full h-32 max-h-56 resize-none"
              onChange={(event) => setUserInput(event.target.value)}
              placeholder={Lookup.INPUT_PLACEHOLDER}
            />
            {input && (
              <ArrowRight
                onClick={() => onGenerate(input)}
                className="bg-gray-500 p-2 h-8 w-8 rounded-md cursor-pointer "
              />
            )}
          </div>
          <div>
            <Link className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
export default ChatView;
