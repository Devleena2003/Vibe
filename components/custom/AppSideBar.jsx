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
function AppSideBar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-2">
        <Image src={"/logo.jpg"} width={50} height={50} />
      </SidebarHeader>
      <SidebarContent className="p-5">
        <Button>
          {" "}
          <MessageCircleCode /> Start New Chat
        </Button>
        <SidebarGroup>
          {" "}
          <WorkspaceHistory />
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

export default AppSideBar;
