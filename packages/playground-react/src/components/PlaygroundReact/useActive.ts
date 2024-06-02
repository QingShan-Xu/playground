import React, { useCallback, useMemo, useState } from 'react'
import { Client, pathBrowser } from "@xqs/playground-client"

type IActiveFile = {
  value: string,
  path: string,
  language: string
}
export const useActive = (
  client: Client
): [IActiveFile, React.Dispatch<React.SetStateAction<string | undefined>>] => {
  const [activeFile, handleActiveFile] = useState<string>()

  const [
    value,
    path,
    language
  ] = useMemo(() => {
    if (!activeFile) {
      return [
        "", "", ""
      ]
    }
    const value = client.Fs.readFileSync(activeFile, "utf-8")
    const path = activeFile
    const language = pathBrowser.extname(activeFile).slice(1)
    return [
      value ?? "",
      path ?? "",
      language ?? ""
    ]
  }, [activeFile])

  return [
    {
      value,
      path,
      language
    },
    handleActiveFile
  ]
}
