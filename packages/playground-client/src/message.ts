import type { IMessage } from "./type";

export class Message {
  messages: IMessage[] = [];
  max: number;
  listeners?: (messages: IMessage) => void;
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
    this.listeners?.(data);
  }

  // 注册监听器
  registerListener(listener: (messages: IMessage) => void) {
    this.listeners = listener;
  }
}
