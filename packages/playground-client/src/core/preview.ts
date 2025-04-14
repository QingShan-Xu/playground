import type { ClientOptions } from "../types";
import { nullthrows } from "../utils";

export class Preview {
  iframe: HTMLIFrameElement;
  constructor(
    iframeSelector: string | HTMLIFrameElement,
    clientOptions: ClientOptions = {},
  ) {
    this.iframe = this.initializeIframe(iframeSelector, clientOptions);
  }

  private initializeIframe(
    iframeSelector: string | HTMLIFrameElement,
    clientOptions: ClientOptions,
  ): HTMLIFrameElement {
    let iframe: HTMLIFrameElement;

    if (typeof iframeSelector === "string") {
      const element = document.querySelector(iframeSelector);
      nullthrows(element, `The element '${iframeSelector}' was not found`);

      iframe = document.createElement("iframe");

      nullthrows(
        element?.parentNode,
        "The given iframe does not have a parent.",
      );
      element?.parentNode!.replaceChild(iframe, element);
    } else {
      iframe = iframeSelector;
    }

    iframe.style.border = "0";
    iframe.style.width = clientOptions.width || "100%";
    iframe.style.height = clientOptions.height || "100%";
    iframe.style.overflow = "hidden";

    if (!iframe.getAttribute("playground")) {
      iframe.setAttribute(
        "playground",
        "allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock",
      );

      iframe.setAttribute(
        "allow",
        "accelerometer; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; clipboard-write;",
      );
    }
    return iframe;
  }

  setHtml(html: string) {
    const iframeDoc =
      this.iframe.contentDocument || this.iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
    }
  }

  update(buildOptions: ClientOptions) {
    this.iframe.style.width = buildOptions.width ?? this.iframe.style.width;
    this.iframe.style.height = buildOptions.height ?? this.iframe.style.height;
  }
}
