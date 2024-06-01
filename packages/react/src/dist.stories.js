import { PlaygroundReact } from "../dist"

export default {
  title: 'PlaygroundReact',
  component: PlaygroundReact,
  parameters: {
    layout: 'centered',
  },
}

export const dist = {
  args: {
    name: "example",
    files: {},
    entry: "/src/index.tsx",
    template: "react",
    width: "300px",
    height: "300px",
  },
}