import React, { useState } from 'react'

type Props = {}

export const useThemes = (props: Props) => {
  const [themes, setThemes] = useState()

  return [themes]
}