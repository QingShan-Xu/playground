
import { Playground } from "@xqcc/playground-react"
import React, { useState } from 'react'

export const PlaygroundExample = () => {

  const [first, setfirst] = useState(1)

  return (
    <div>
      {first}
      <Playground
        template="react"
        name="docs-example"
      />
    </div>
  )
}