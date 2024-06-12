import { dequal as deepEqual } from "dequal";

import { Ipc } from "./ipc";
import { Message } from "./message";
import { Preview } from "./preview";
import type { ClientOptions, PlaygroundSetup } from "./type";
import { addPackageJSONIfNeeded, generateHtml, getTemplate } from "./utils";

export class Client {
  playgroundSetup: PlaygroundSetup;
  options: ClientOptions;

  message = new Message();
  ipc!: Ipc;
  preview: Preview;

  constructor(
    iframeSelector: string | HTMLIFrameElement,
    playgroundSetup: PlaygroundSetup,
    options: ClientOptions = {},
  ) {
    this.options = options;
    this.playgroundSetup = playgroundSetup;
    this.preview = new Preview(iframeSelector, options);
    this.updateTemplate();
  }

  public async init() {
    // init ipc
    this.ipc = await Ipc.getInstance();
    this.message.set({ type: "success", message: "init-ipc-successful" });

    this.message.set({ type: "success", message: "init-playground-success" });
    return true;
  }

  public async build() {
    this.message.set({ type: "info", message: "building" });
    const startTimestamp = Date.now();
    const buildRes = await this.ipc.postMessage({
      type: "build",
      options: this.playgroundSetup.buildOptions,
      files: this.playgroundSetup.files,
    });
    this.message.set({
      type: "success",
      message: `build-success: ${Date.now() - startTimestamp}ms`,
    });

    if (this.playgroundSetup.defaultTemplate === "react") {
      const htmlFile = this.playgroundSetup.files!["/index.html"];
      const html = generateHtml(htmlFile, buildRes.modules);
      this.preview.setHtml(html);
    }
  }

  public async updateOptions(options: ClientOptions) {
    if (!deepEqual(this.options, options)) {
      this.options = {
        ...this.options,
        ...options,
      };
      this.preview.update(this.options);
    }
  }

  private updateTemplate() {
    const template = getTemplate(this.playgroundSetup.defaultTemplate);
    if (!template) {
      this.playgroundSetup.files = addPackageJSONIfNeeded(this.playgroundSetup);
      return;
    }
    if (!this.playgroundSetup.buildOptions.entry) {
      this.playgroundSetup.buildOptions.entry = template.entry;
    }
    this.playgroundSetup.files = {
      ...template.files,
      ...this.playgroundSetup.files,
    };
    this.playgroundSetup.dependencies = {
      ...template.dependices,
      ...this.playgroundSetup.dependencies,
    };
    this.playgroundSetup.files = addPackageJSONIfNeeded(this.playgroundSetup);
    this.message.set({ type: "success", message: "update-fs-successful" });
  }

  public async updateSandbox(playgroundSetup: PlaygroundSetup) {
    if (
      !!playgroundSetup.defaultTemplate &&
      playgroundSetup.defaultTemplate !== this.playgroundSetup.defaultTemplate
    ) {
      this.message.set({
        type: "warning",
        message:
          "The defaultTemplate takes effect only once and does not support updates",
      });
    }

    this.playgroundSetup = {
      ...this.playgroundSetup,
      ...playgroundSetup,
    };

    this.updateTemplate();
    await this.build();
  }
}
