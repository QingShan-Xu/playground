import { beforeEach, describe, expect, test, vitest } from "vitest";

import { Message } from "./message";
import type { IMessage } from "./type";

describe("Message", () => {
  let message: Message;
  const maxMessages = 30;

  beforeEach(() => {
    message = new Message(maxMessages);
  });

  test("should initialize with default max messages", () => {
    expect(message.max).toBe(maxMessages);
    expect(message.messages.length).toBe(1);
    expect(message.messages[0].type).toBe("success");
    expect(message.messages[0].message).toBe("init-message-success");
  });

  test("should add new message and call listeners", () => {
    const mockListener = vitest.fn();
    message.registerListener(mockListener);

    const newMessage: IMessage = {
      type: "info",
      message: "new-message",
    };
    message.set(newMessage);

    expect(message.messages.length).toBe(2);
    expect(message.messages[1]).toEqual(newMessage);
    expect(mockListener).toHaveBeenCalledWith(newMessage);
  });

  test("should remove the first message when max messages are reached", () => {
    for (let i = 0; i < maxMessages; i++) {
      message.set({
        type: "warning",
        message: `warning-${i}`,
      });
    }

    message.set({
      type: "error",
      message: "error-message",
    });

    expect(message.messages.length).toBe(maxMessages);
    expect(message.messages[message.messages.length - 1].type).toBe("error");
    expect(message.messages[message.messages.length - 1].message).toBe(
      "error-message",
    );
  });
});
