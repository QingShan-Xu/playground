import { SortableTree } from "@/components/SortableTree"
import { DataNode } from "rc-tree/lib/interface"

type Props = {
  treeData: DataNode[]
  onEdit?: (node: DataNode, newV: string) => void
  onClickFile?: (node: DataNode) => void
}

export const MenuTree = (props: Props) => {

  const {
    treeData,
    onEdit,
    onClickFile
  } = props

  return (
    <SortableTree
      height={200}
      onEdit={onEdit}
      treeData={treeData}
      onClickFile={onClickFile}
    />
  )
}