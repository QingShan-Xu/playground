import React, { Key } from 'react'

type IPreviewProps = {
  iframeId: Key
}

export const IDPre = "playground-"

export const Preview: React.FC<IPreviewProps> = props => {
  const {
    iframeId,
  } = props

  const id = IDPre + iframeId

  return (
    <div className="__playground_preview h-full flex">
      <iframe id={id} />
    </div>
  )
}