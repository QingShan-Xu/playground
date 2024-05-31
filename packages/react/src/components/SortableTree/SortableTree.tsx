import Tree, { TreeNodeProps, TreeProps } from 'rc-tree'
import { DataNode } from "rc-tree/lib/interface"
import { Key, useCallback, useEffect, useRef } from "react"
import arrowSvg from "../../assets/tree/arrow.svg"
import fileSvg from "../../assets/tree/default_file.svg"
import folderSvg from "../../assets/tree/default_folder.svg"
import folderOpenSvg from "../../assets/tree/default_folder_opened.svg"
import { Input } from "../../ui"
import "./index.less"

type IMyDataNode = DataNode

type IProps = Omit<Partial<TreeProps>, "titleRender" | "icon" | "switcherIcon"> & {
  // eslint-disable-next-line no-unused-vars
  onEdit?: (node: DataNode, newV: string) => void
  onClickFile?: (node: DataNode) => void
}

export const SortableTree = ({ onEdit, onClickFile, ...props }: IProps) => {
  const treeRef = useRef<Tree<DataNode>>(null)
  const cacheRef = useRef({ onEdit })

  useEffect(() => {
    if (!treeRef.current) {
      return
    }
    treeRef.current.onNodeDoubleClick = (e, node) => {
      e.stopPropagation()
      treeRef.current?.setState(state => ({
        ...state,
        editKey: node.key,
      }))
    }

    treeRef.current.onNodeClick = (e, node) => {
      e.stopPropagation()
      if (!node.isLeaf || !onClickFile) {
        return
      }
      onClickFile(node)
    }
  }, [])

  const genIcon = useCallback((props: TreeNodeProps<IMyDataNode>) => {
    if (!props.isLeaf && props.expanded) {
      return (
        <img className={`w-2.5 h-2.5`} src={folderOpenSvg} />
      )
    }
    if (!props.isLeaf && !props.expanded) {
      return (
        <img className={`w-2.5 h-2.5`} src={folderSvg} />
      )
    }
    // if (ext2Src?.[item.id as keyof {}]) {
    //   return ext2Src[item.id as keyof {}]
    // }
    return (
      <img className={`w-2.5 h-2.5`} src={fileSvg} />
    )
  }, [

  ])

  const genSwitcherIcon = useCallback((props: TreeNodeProps<IMyDataNode>) => {
    if (!props.isLeaf) {
      return (
        <img className={`w-2.5 h-2.5 ${props.expanded ? "rotate-90" : ""}`} src={arrowSvg} />
      )
    }
    return null
  }, [

  ])

  const genTitle = useCallback((node: IMyDataNode) => {
    return (
      <div
        className={`
          flex items-center
          pr-2 
          text-foreground text-xs 
        `}>
        {genInputOrText(node)}
      </div>
    )
  }, [

  ])

  const fouscAll = useCallback((e: HTMLInputElement | null) => {
    e?.select()
  }, [])

  const genInputOrText = useCallback((node: IMyDataNode) => {
    const editKey = (treeRef.current?.state as any)?.editKey
    const isEdit = editKey === node.key

    if (isEdit) {
      return (
        <Input
          ref={fouscAll}
          autoFocus
          className={`
            w-full rounded-sm h-5 
            text-xs
            px-1 py-0.5
            focus-visible:transform
            `}
          defaultValue={node.title as string}
          onBlur={e => {
            cacheRef.current.onEdit?.(node, e.target.value)
            treeRef.current?.setState(state => ({ ...state, editKey: undefined }))
          }}
        />
      )
    }

    return node.title as string
  }, [

  ])



  return (
    <Tree
      ref={treeRef}
      titleRender={genTitle}
      icon={genIcon}
      switcherIcon={genSwitcherIcon}
      {...props}
    />
  )

}
