import { beforeEach, describe, expect, it } from "vitest";

import { Preview } from "./preview";
import type { ClientOptions } from "./type";

describe("Preview", () => {
  let preview: Preview;
  let iframe: HTMLIFrameElement;

  beforeEach(() => {
    // Create a mock iframe element
    iframe = document.createElement("iframe");
    // Initialize the Preview instance with the mock iframe
    preview = new Preview(iframe);
  });

  describe("initializeIframe", () => {
    it("should create a new iframe element if iframeSelector is a string", () => {
      const selector = "#test-iframe";
      const element = document.createElement("div");
      element.id = "test-iframe";
      document.body.appendChild(element);

      preview = new Preview(selector);

      expect(preview.iframe).toBeInstanceOf(HTMLIFrameElement);
      expect(preview.iframe.style.border).toBe("0px");
      expect(preview.iframe.style.width).toBe("100%");
      expect(preview.iframe.style.height).toBe("100%");
      expect(preview.iframe.style.overflow).toBe("hidden");
      expect(preview.iframe.getAttribute("playground")).toBeTruthy();
      expect(preview.iframe.getAttribute("allow")).toBeTruthy();
    });

    it("should use the given iframe element if iframeSelector is an HTMLIFrameElement", () => {
      preview = new Preview(iframe);

      expect(preview.iframe).toBe(iframe);
      expect(preview.iframe.style.border).toBe("0px");
      expect(preview.iframe.style.width).toBe("100%");
      expect(preview.iframe.style.height).toBe("100%");
      expect(preview.iframe.style.overflow).toBe("hidden");
      expect(preview.iframe.getAttribute("playground")).toBeTruthy();
      expect(preview.iframe.getAttribute("allow")).toBeTruthy();
    });
  });

  describe("setHtml", () => {
    it("should set the HTML content of the iframe", () => {
      const html = "<h1>Test</h1>";
      preview.setHtml(html);

      const iframeDoc = preview.iframe.contentDocument;
      if (iframeDoc) {
        expect(iframeDoc.documentElement.innerHTML).toBe(html);
      }
    });
  });

  describe("update", () => {
    it("should update the width and height of the iframe", () => {
      const buildOptions: ClientOptions = { width: "50%", height: "50%" };
      preview.update(buildOptions);

      expect(preview.iframe.style.width).toBe("50%");
      expect(preview.iframe.style.height).toBe("50%");
    });

    it("should keep the current width and height if the buildOptions are not provided", () => {
      const initialWidth = preview.iframe.style.width;
      const initialHeight = preview.iframe.style.height;
      preview.update({});

      expect(preview.iframe.style.width).toBe(initialWidth);
      expect(preview.iframe.style.height).toBe(initialHeight);
    });
  });
});
