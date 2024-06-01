import type { IMessage } from "./type";

export class Message {
  messages: IMessage[] = [];
  max: number;
  constructor(max = 30) {
    this.max = max;
    this.set({
      type: "success",
      message: "init-message-success",
    });
  }

  set(data: IMessage) {
    if (this.messages.length >= this.max) {
      this.messages.shift();
    }
    this.messages.push(data);
    if (data.type === "error") {
      console.error(data.message);
      return;
    }
    if (data.type === "warn") {
      console.warn(data.message);
      return;
    }
    console.log(data.message);
  }
}
