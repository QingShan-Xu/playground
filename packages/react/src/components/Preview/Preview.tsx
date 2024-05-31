import React, { Key, useId } from 'react'

type IPreviewProps = {
  iframeId: Key
  style?: React.CSSProperties
}

export const IDPre = "playground-"

export const Preview: React.FC<IPreviewProps> = props => {
  const {
    iframeId,
    style = { width: 240, height: 240 },
  } = props

  const id = IDPre + iframeId

  return (
    <div style={style} className="border-l border-b border-r">
      <iframe id={id} />
    </div>
  )
}