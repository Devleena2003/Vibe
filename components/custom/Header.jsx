"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { useContext } from "react";
import { UserDetailContext } from "@/context/UserDetailContext";
import SignInDialog from "@/components/custom/SignInDialog";

function Header() {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [openDialog, setOpenDialog] = useState(false);
  return (
    <>
      <div className="flex px-2 justify-between items-center">
        <Image src="/logo.jpg" alt="logo" width={50} height={40} />
        {userDetail?.name && (
          <div className="flex items-center gap-3">
            <Image
              src={userDetail.picture}
              alt="user"
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
        )}
        {!userDetail?.name && (
          <div className="flex gap-5">
            <Button variant="ghost" onClick={() => setOpenDialog(true)}>
              Sign In
            </Button>
            <Button onClick={() => setOpenDialog(true)}>Get Started</Button>
          </div>
        )}
      </div>

      <SignInDialog openDialog={openDialog} closeDialog={setOpenDialog} />
    </>
  );
}
export default Header;
