


export type IIpcMsg2Worker =
  | { type: "init-esbuild", data: { wasmURL: string; }; }
  | { type: "build", data: undefined; }; // todo

export type IIpcMsg2Main =
  | { type: "init-esbuild-suc", data: undefined; }
  | { type: "init-esbuild-err", data: { error: string; }; }
  | { type: "build-suc", data: undefined; }// todo
  | { type: "build-err", data: { error: string; }; };// todo
