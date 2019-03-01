import React, { useEffect, useRef } from "react";

/**
 * ExtensionContainerWrapper is a simple wrap to wrap ExtensionContainer into Shell
 *
 * Currently the messaging receiving is handled here, but this is not ideal, because
 * we may have multiple wrappers at same time
 */
function ExtensionContainerWrapper(porps) {
  const iframeEl = useRef(null);
  const { data, column, onChange } = porps;

  useEffect(() => {
    window.addEventListener("message", receiveMessage, false);

    return function removeListener() {
      window.removeEventListener("message", receiveMessage, false);
    };
  }, []);

  useEffect(() => {
    iframeEl.current.contentWindow.postMessage(data);
  }, [porps.data]);

  function receiveMessage(event) {
    if (event.data.from && event.data.from === "editor") {
      const commond = event.data.commond;
      switch (commond) {
        //need to use the load event of the document contained in the iframe, not the iframe itself.
        case "onLoad":
          postMessage();
          break;
        case "save":
          onChange(event.data.data);
          break;
        default:
          break;
      }
    }
  }

  function postMessage() {
    iframeEl.current.contentWindow.postMessage(data);
  }

  return (
    <iframe
      ref={iframeEl}
      title={column}
      style={{
        height: "100%",
        width: "750px",
        borderWidth: "0px",
        float: "right"
      }}
      src="/extensionContainer.html"
    />
  );
}

export default ExtensionContainerWrapper;
