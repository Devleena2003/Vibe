import React, { useEffect, useRef } from "react";
import { SandpackPreview, useSandpack } from "@codesandbox/sandpack-react";
function SandpackPreviewClient() {
  const previewRef = useRef();
  const { sandpack } = useSandpack();
  useEffect(() => {
    GetSandpackClient();
  }, [sandpack]);
  const GetSandpackClient = () => {
    const client = previewRef.current?.getClient();
    if (client) {
      console.log(client);
    }
  };
  return (
    <div>
      <SandpackPreview
        ref={previewRef}
        style={{ height: "80vh" }}
        showNavigator={true}
      />
    </div>
  );
}

export default SandpackPreviewClient;
