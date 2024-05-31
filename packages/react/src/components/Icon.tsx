import React, { memo } from 'react'

type Props = {
  name: string
  className?: string
}

export const Icon = memo(({
  name,
  className = ""
}: Props) => {
  return (
    <svg
      className={`w-3.5 h-3.5 fill-current overflow-hidden ` + className}
      aria-hidden="true">
      <use xlinkHref={`#${name}`}></use>
    </svg>
  )
})   