import mulu from "@/assets/svg/playground_mulu.svg"
import { CodeEditor } from "@/components/CodeEditor"
import { Header } from "@/components/Header"
import { MenuTree } from "@/components/MenuTree/MenuTree"
import { IDPre, Preview } from "@/components/Preview"
import { Client, ClientOptions, PlaygroundSetup, pathBrowser } from "@xqs/playground-client"
import { DataNode } from "rc-tree/lib/interface"
import React, { ReactNode, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ShowInfo, IShowInfoRef } from "@/components/ShowInfo"
import { useActive } from "./useActive"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui"
import { debounce } from "lodash"

export type IPlaygroundReact = PlaygroundSetup & Omit<ClientOptions, "width" | "height"> & {
  loading?: ReactNode
  styles?: {
    editorStyle?: React.CSSProperties
    previewStyle?: React.CSSProperties
    headStyle?: React.CSSProperties
  }
}

export const PlaygroundReact = memo((props: IPlaygroundReact) => {
  const clientRef = useRef<Client>(null!)
  const showInfoRef = useRef<IShowInfoRef>(null!)
  const [playground_id] = useState(Date.now())
  const [isLoading, setIsLoading] = useState(true)
  const [treeData, setTreeData] = useState<DataNode[]>([])

  const [
    {
      value,
      language,
      path
    },
    setActiveFile
  ] = useActive(clientRef.current)

  const {
    name,
    files = {},
    template = "",
    entry = "",
    dependencies,
    devDependencies,
    externalResources,
    startRoute,
    styles
  } = props

  useEffect(() => {
    init()
  }, [

  ])

  const init = async () => {
    clientRef.current = new Client(
      `#${IDPre}${playground_id}`,
      {
        name,
        files,
        template: template as PlaygroundSetup["template"],
        entry,
        dependencies,
        devDependencies
      },
      {
        externalResources,
        startRoute,
        width: "100%",
        height: "100%"
      }
    )
    if (showInfoRef.current?.handleNextMessage) {

      clientRef.current.Message.registerListener(showInfoRef.current.handleNextMessage)

    }
    await clientRef.current.init()
    await clientRef.current.build()
    setTreeData(readDirRecursiveSync("/"))
    setActiveFile(entry || clientRef.current.playgroundSetup.entry)
    setIsLoading(false)
  }

  const readDirRecursiveSync = (dir: string): DataNode[] => {
    const files = clientRef.current.Fs.readdirSync(dir) ?? []
    return files.map(file => {
      const filePath = pathBrowser.join(dir, file)
      const stats = clientRef.current.Fs.statSync(filePath)
      if (stats?.isDirectory()) {
        return {
          key: filePath,
          title: file,
          children: readDirRecursiveSync(filePath),
          dir
        }
      } else {
        return {
          key: filePath,
          title: file,
          isLeaf: true,
          dir
        }
      }
    })
  }

  const handleFileEdit = async (node: DataNode, newV: string) => {
    if (node.title == newV) {
      return
    }
    // @ts-ignore
    const newPath = pathBrowser.join(node.dir, newV)
    clientRef.current.Fs.renameSync(String(node.key), newPath)
    setTreeData(readDirRecursiveSync("/"))
    await clientRef.current.build()
  }

  const handleClickFile = (node: DataNode) => {
    setActiveFile(String(node.key))
  }

  const handleCodeChange = useCallback(debounce(async (v: string, path: string) => {
    clientRef.current.Fs.writeFileSync(path, v)
    await clientRef.current.build()
  }, 500), [])

  const left = useMemo(() => [
    {
      trigger: <img className={`w-3.5 h-3.5`} src={mulu}></img>,
      key: 1,
      content: (
        <MenuTree
          onEdit={handleFileEdit}
          onClickFile={handleClickFile}
          treeData={treeData} />
      )
    }
  ], [treeData])

  return (
    <ResizablePanelGroup
      direction="vertical"
      className="__playground_root max-w-md rounded-lg border min-h-60 min-w-96">
      <ResizablePanel className="!flex-none" >
        <Header
          left={left}
          right={<ShowInfo ref={showInfoRef} />}
          title={name}
          style={styles?.headStyle} />
      </ResizablePanel>
      <ResizablePanel className="!flex-auto h-0">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full">
          <ResizablePanel defaultSize={60} className="w-0">
            <CodeEditor
              themes={["github-light"]}
              value={value}
              language={language}
              path={path}
              onChange={handleCodeChange} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} className="w-0">
            <Preview
              iframeId={playground_id} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>

  )
})
