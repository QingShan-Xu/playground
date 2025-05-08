export type IMsg = { type: "success"; message: string; } | { type: "error"; message: string; };

export interface IMsgSubject {
  addReceiver(receiver: IMsgReceiver): void;
  removeReceiver(receiver: IMsgReceiver): void;
  broadcast(msg: IMsg): void;
}

export interface IMsgReceiver {
  onMsg(msg: IMsg): void;
}

export class MsgSubject implements IMsgSubject {
  private receivers: IMsgReceiver[] = [];

  addReceiver(receiver: IMsgReceiver): void {
    this.receivers.push(receiver);
  }

  removeReceiver(receiver: IMsgReceiver): void {
    this.receivers = this.receivers.filter((r) => r !== receiver);
  }

  broadcast(msg: IMsg): void {
    this.receivers.forEach((receiver) => {
      receiver.onMsg(msg);
    });
  }
}