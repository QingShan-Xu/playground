import { IMessage } from "@xu-castle-peak/playground-client"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

type Props = {}

export type IShowInfoRef = {
  handleNextMessage: (message: IMessage) => void
}

const type2Color: Record<IMessage["type"], string> = {
  "error": "red",
  "normal": "#333333",
  "success": "green",
  "warn": "yellow"
}

export const ShowInfo = forwardRef<IShowInfoRef, Props>((props, ref) => {
  const [msgRenders, setMsgRenders] = useState<IMessage[]>([])
  const [msgRender, setMsgRender] = useState<IMessage>()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleNextMessage: IShowInfoRef["handleNextMessage"] = message => {
    setMsgRenders(prev => [...prev, message])
  }

  useImperativeHandle(ref, () => ({
    handleNextMessage
  }))

  useEffect(() => {
    const displayNextMessage = () => {
      if (msgRenders.length > 0) {
        setMsgRender(msgRenders[0])
        setMsgRenders(prev => prev.slice(1))
      } else {
        setMsgRender(undefined)
      }
    }

    // 开始定时器
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        displayNextMessage()
      }, 500)
    }

    return () => {
      // 清除定时器
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [msgRenders])

  useEffect(() => {
    if (!msgRender && msgRenders.length > 0) {
      setMsgRender(msgRenders[0])
      setMsgRenders(prev => prev.slice(1))
    }
  }, [msgRender, msgRenders])

  return (
    <span
      style={{ color: type2Color[msgRender?.type || "normal"] }}
      className="text-xs font-semibold">
      {msgRender?.message}
    </span>
  )
})
