import { Client, ClientOptions, SandboxSetup, pathBrowser } from "@playground/client"
import { DataNode } from "rc-tree/lib/interface"
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CodeEditor } from "../CodeEditor"
import { Header } from "../Header"
import { Icon } from "../Icon"
import { MenuTree } from "../MenuTree"
import { IDPre, Preview } from "../Preview"
import { PlaygroundContext } from "../../context/playgroundContext"
import { throttle } from "../../utils/throttle"
import mulu from "../../assets/icon/mulu.svg"

type Props = SandboxSetup & Omit<ClientOptions, "width" | "height"> & {
  loading?: ReactNode
  styles?: {
    editorStyle?: React.CSSProperties
    previewStyle?: React.CSSProperties
    headStyle?: React.CSSProperties
  }
}

export const PlaygroundReact = (props: Props) => {
  const clientRef = useRef<Client>()
  const [isLoading, setIsLoading] = useState(true)
  const [treeData, setTreeData] = useState<DataNode[]>([])

  const {
    name,
    files,
    template,
    entry,
    dependencies,
    devDependencies,
    externalResources,
    startRoute,
    styles
  } = props

  const [activeFile, setActiveFile] = useState<string>()

  const iframeId = ""

  const init = useCallback(async () => {
    clientRef.current = new Client(
      `#${IDPre}${iframeId}`,
      {
        name,
        files,
        template,
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

    await clientRef.current.init()
    await clientRef.current.build()
    setTreeData(readDirRecursiveSync("/"))
    setActiveFile(entry)
    setIsLoading(false)
  }, [

  ])

  useEffect(() => {
    init()
  }, [

  ])

  const readDirRecursiveSync = useCallback((dir: string): DataNode[] => {
    const files = clientRef.current?.Fs.readdirSync(dir) ?? []
    return files.map(file => {
      const filePath = pathBrowser.join(dir, file)
      const stats = clientRef.current?.Fs.statSync(filePath)
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
  }, [

  ])

  const handleFileEdit = useCallback(async (node: DataNode, newV: string) => {
    if (node.title == newV) {
      return
    }
    // @ts-ignore
    const newPath = pathBrowser.join(node.dir, newV)
    clientRef.current?.Fs.renameSync(String(node.key), newPath)
    setTreeData(readDirRecursiveSync("/"))
    await clientRef.current?.build()
  }, [

  ])

  const handleClickFile = useCallback((node: DataNode) => {
    setActiveFile(String(node.key))
  }, [

  ])

  const [
    value,
    path,
    language
  ] = useMemo(() => {
    if (!activeFile) {
      return []
    }
    const value = clientRef.current?.Fs.readFileSync(activeFile, "utf-8")
    const path = activeFile
    const language = pathBrowser.extname(activeFile).slice(1)
    return [
      value,
      path,
      language
    ]
  }, [activeFile])

  const handleCodeChange = useCallback(throttle(async (v: string, path: string) => {
    clientRef.current?.Fs.writeFileSync(path, v)
    await clientRef.current?.build()
  }, 500), [])

  return (
    <PlaygroundContext>
      <Header
        left={[
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
        ]}
        // right={[
        //   {
        //     trigger: <Icon name="shezhi" />,
        //     key: 1,
        //     content: <MenuTree treeData={treeData} />
        //   }
        // ]}
        title={name}
        style={styles?.headStyle} />
      <div style={{ display: "flex" }}>
        <CodeEditor
          themes={["github-light"]}
          value={value}
          language={language}
          path={path}
          onChange={handleCodeChange}
          style={styles?.editorStyle} />

        <Preview
          style={styles?.previewStyle}
          iframeId={iframeId} />
      </div>
    </PlaygroundContext>
  )
}
