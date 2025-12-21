"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Button } from "../ui/button";
import { MessageCircleCode } from "lucide-react";
import WorkspaceHistory from "@/components/custom/WorkspaceHistory";
import Footer from "@/components/custom/Footer";
import { useRouter } from "next/navigation";
function AppSideBar() {
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarHeader className="p-2">
        <Image src={"/logo.jpg"} width={50} height={50} alt="image" />
      </SidebarHeader>
      <SidebarContent className="p-5">
        <Button onClick={() => router.push("/")}>
          {" "}
          <MessageCircleCode /> Start New Chat
        </Button>
        <SidebarGroup>
          {" "}
          <WorkspaceHistory />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Footer />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSideBar;
