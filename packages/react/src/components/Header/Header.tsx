import React from "react"
import { Button, Popover, PopoverContent, PopoverTrigger } from "../../ui"
import { Key, ReactNode } from 'react'

type IRenderItem = {
  key: Key
  trigger: ReactNode,
  content: ReactNode
}

type Props = {
  title: string
  style?: React.CSSProperties
  left?: IRenderItem[]
  right?: IRenderItem[]
}

export const Header = ({
  left,
  right,
  title,
  style
}: Props) => {
  return (
    <div
      style={style}
      className="px-2 h-8 flex-none bg-background flex items-center justify-between border">

      <div className="flex flex-1">
        {left?.map(left => (
          <Popover key={left.key}>
            <PopoverTrigger asChild>
              <Button
                size={"icon"}
                className="h-6 w-6">
                {left.trigger}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="p-0 w-auto min-w-40 max-w-52">
              {left.content}
            </PopoverContent>
          </Popover>
        ))}
      </div>

      <div className="text-primary text-sm subpixel-antialiased tracking-wide font-mono font-semibold flex-none">
        {title}
      </div>

      <div className="flex flex-1 justify-end">
        {right?.map(left => (
          <Popover key={left.key}>
            <PopoverTrigger asChild>
              <Button
                size={"icon"}
                className="h-6 w-6">
                {left.trigger}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="p-0 w-auto min-w-40 max-w-52">
              {left.content}
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </div>
  )
}
