import { PlaygroundReact } from "./PlaygroundReact";
import type { Meta, StoryObj } from "@storybook/react";

type IMeta = React.ComponentProps<typeof PlaygroundReact>;

const meta: Meta<IMeta> = {
  title: "PlaygroundReact",
  component: PlaygroundReact,
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const example = {
  args: {
    name: "example",
    defaultTemplate: "react",
  },
};
