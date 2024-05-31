import { fn } from '@storybook/test'
import { Button } from './Button'

// 有关如何设置故事的更多信息，请访问：https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Example/Button',
  component: Button,
  parameters: {
    // 用于使组件在画布中居中的可选参数。更多信息：https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // 该组件将有一个自动生成的 Autodocs 条目：https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // 有关 argType 的更多信息：https://storybook.js.org/docs/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
  // 使用“fn”监视 onClick arg，一旦调用，它将出现在操作面板中：https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
}

// 有关使用参数编写故事的更多信息：https://storybook.js.org/docs/writing-stories/args
export const Primary = {
  args: {
    primary: true,
    label: 'Button',
  },
}

export const Secondary = {
  args: {
    label: 'Button',
  },
}

export const Large = {
  args: {
    size: 'large',
    label: 'Button',
  },
}

export const Small = {
  args: {
    size: 'small',
    label: 'Button',
  },
}


export const Warning = {
  args: {
    primary: true,
    label: 'Delete now',
    backgroundColor: 'red',
  }
}