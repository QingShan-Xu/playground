import { nullthrows } from "./utils"

self.addEventListener("message", ({ data }) => {
  try {
    const res = triger(data.args)
    postMessage({ result: res, ipcId: data.ipcId })
  } catch (error) {
    postMessage({ error, ipcId: data.ipcId })
  }
})

const triger = async (data: any) => {
  if (data === "test-res") {
    return "test-res"
  }

  if (data === "test-rej") {
    return new Error("test-rej")
  }
}    