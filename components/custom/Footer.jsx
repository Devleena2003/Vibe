import React, { useContext } from "react";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { UserDetailContext } from "@/context/UserDetailContext";
function Footer() {
  const { setUserDetail } = useContext(UserDetailContext);

  const handleSignOut = () => {
    localStorage.removeItem("user");

    setUserDetail(null);

    window.location.href = "/";
  };

  const options = [
    {
      name: "Sign Out",
      icon: LogOut,
    },
  ];
  return (
    <div className="mb-10 p-5">
      {options.map((option, index) => (
        <Button
          variant="ghost"
          className="w-full flex justify-start"
          key={index}
          onClick={handleSignOut}
        >
          <option.icon />
          {option.name}
        </Button>
      ))}
    </div>
  );
}

export default Footer;
