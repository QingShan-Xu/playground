import mulu from "@/assets/svg/playground_mulu.svg";
import { CodeEditor } from "@/components/CodeEditor";
import { Header } from "@/components/Header";
import { MenuTree } from "@/components/MenuTree/MenuTree";
import { IDPre, Preview } from "@/components/Preview";
import { IShowInfoRef, ShowInfo } from "@/components/ShowInfo";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui";
import {
  Client,
  ClientOptions,
  PlaygroundSetup,
} from "@xqcc/playground-client";
import { DataNode } from "rc-tree/lib/interface";
import React, {
  ReactNode,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useActive } from "./useActive";

export type IPlaygroundReact = PlaygroundSetup &
  Omit<ClientOptions, "width" | "height"> & {
    loading?: ReactNode;
    styles?: {
      editorStyle?: React.CSSProperties;
      previewStyle?: React.CSSProperties;
      headStyle?: React.CSSProperties;
    };
  };

export const PlaygroundReact = memo((props: IPlaygroundReact) => {
  const clientRef = useRef<Client>(null!);
  const showInfoRef = useRef<IShowInfoRef>(null!);
  const [playground_id] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [treeData, setTreeData] = useState<DataNode[]>([]);

  const [{ value, language, path }, setActiveFile] = useActive(
    clientRef.current,
  );

  const {
    name,
    files = {},
    defaultTemplate,
    buildOptions,
    dependencies,
    devDependencies,
    externalResources,
    styles,
  } = props;

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    clientRef.current = new Client(
      `#${IDPre}${playground_id}`,
      {
        name,
        files,
        buildOptions,
        dependencies,
        devDependencies,
        defaultTemplate,
      },
      {
        externalResources,
        width: "100%",
        height: "100%",
      },
    );
    if (showInfoRef.current?.handleNextMessage) {
      clientRef.current.message.registerListener(
        showInfoRef.current.handleNextMessage,
      );
    }
    await clientRef.current.init();
    await clientRef.current.build();

    setActiveFile(clientRef.current.playgroundSetup.buildOptions.entry);
    setIsLoading(false);
  };

  const handleClickFile = (node: DataNode) => {
    setActiveFile(String(node.key));
  };

  const left = useMemo(
    () => [
      {
        trigger: <img className={`w-3.5 h-3.5`} src={mulu}></img>,
        key: 1,
        content: (
          <MenuTree
            // onEdit={handleFileEdit}
            onClickFile={handleClickFile}
            treeData={treeData}
          />
        ),
      },
    ],
    [treeData],
  );

  return (
    <ResizablePanelGroup
      direction="vertical"
      className="__playground_root max-w-md rounded-lg border min-h-60 min-w-96"
    >
      <ResizablePanel className="!flex-none">
        <Header
          left={left}
          right={<ShowInfo ref={showInfoRef} />}
          title={name}
          style={styles?.headStyle}
        />
      </ResizablePanel>
      <ResizablePanel className="!flex-auto h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={50} className="w-0">
            <CodeEditor
              themes={["github-light"]}
              value={value}
              language={language}
              path={path}
              // onChange={handleCodeChange}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} className="w-0">
            <Preview iframeId={playground_id} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
});
