globalThis.addEventListener("message", async ({ data }) => {
  try {
    postMessage({ result: { type: "success", ...values }, ipcId: data.ipcId });
  } catch (error) {
    postMessage({ error, ipcId: data.ipcId });
  }
});