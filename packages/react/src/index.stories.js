import { PlaygroundReact } from "./index"

export default {
  title: 'PlaygroundReact',
  component: PlaygroundReact,
  parameters: {
    // 用于使组件在画布中居中的可选参数。更多信息：https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
}

export const example = {
  args: {
    name: "example",
    files: {},
    entry: "/src/index.tsx",
    template: "react",
    width: "300px",
    height: "300px",
  },

}