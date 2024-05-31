import { Client } from "./src"
const client = new Client("#sandpack", {
  name: "name",
  files: {},
  entry: "/index.ts",
  template: "react"
}, {
})

client.init()