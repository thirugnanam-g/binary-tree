"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCcw, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import type { JSX } from "react/jsx-runtime"

interface TreeNode {
  id: string
  left: TreeNode | null
  right: TreeNode | null
}

interface NodePosition {
  x: number
  y: number
  level: number
}

export default function TreeBuilder() {
  const [availableNodes] = useState([
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
  ])
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [assigningQueue, setAssigningQueue] = useState<TreeNode[]>([])
  const [usedNodes, setUsedNodes] = useState<string[]>([])
  const { theme, setTheme } = useTheme()

  const handleNodeClick = (nodeId: string) => {
    if (usedNodes.includes(nodeId)) return

    const newNode: TreeNode = {
      id: nodeId,
      left: null,
      right: null,
    }

    setUsedNodes((prev) => [...prev, nodeId])

    if (!tree) {
      setTree(newNode)
      setAssigningQueue([newNode])
    } else {
      const cloneTree = (node: TreeNode): TreeNode => ({
        id: node.id,
        left: node.left ? cloneTree(node.left) : null,
        right: node.right ? cloneTree(node.right) : null,
      })

      const newTree = cloneTree(tree)

      const findNodeInTree = (root: TreeNode, targetId: string): TreeNode | null => {
        if (root.id === targetId) return root
        if (root.left) {
          const found = findNodeInTree(root.left, targetId)
          if (found) return found
        }
        if (root.right) {
          const found = findNodeInTree(root.right, targetId)
          if (found) return found
        }
        return null
      }

      const currentParent = findNodeInTree(newTree, assigningQueue[0].id)

      if (currentParent) {
        if (!currentParent.left) {
          currentParent.left = newNode
          setAssigningQueue((prev) => [...prev, newNode])
        } else if (!currentParent.right) {
          currentParent.right = newNode
          setAssigningQueue((prev) => [...prev.slice(1), newNode])
        }
      }

      setTree(newTree)
    }
  }

  const resetTree = () => {
    setTree(null)
    setAssigningQueue([])
    setUsedNodes([])
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const calculateNodePositions = (
    node: TreeNode | null,
    level = 0,
    position = 0,
  ): Map<string, NodePosition> => {
    const positions = new Map<string, NodePosition>()
    if (!node) return positions

    const containerWidth = 520
    const maxNodesAtLevel = Math.pow(2, level)
    const levelSpacing = containerWidth / (maxNodesAtLevel + 1)
    const x = levelSpacing * (position + 1)
    const y = 60 + level * 70

    positions.set(node.id, { x, y, level })

    if (node.left) {
      const leftPositions = calculateNodePositions(node.left, level + 1, position * 2)
      leftPositions.forEach((pos, id) => positions.set(id, pos))
    }

    if (node.right) {
      const rightPositions = calculateNodePositions(node.right, level + 1, position * 2 + 1)
      rightPositions.forEach((pos, id) => positions.set(id, pos))
    }

    return positions
  }

  const renderConnections = (node: TreeNode | null, positions: Map<string, NodePosition>): JSX.Element[] => {
    if (!node) return []

    const connections: JSX.Element[] = []
    const nodePos = positions.get(node.id)

    if (node.left && nodePos) {
      const leftPos = positions.get(node.left.id)
      if (leftPos) {
        connections.push(
          <motion.line
            key={`${node.id}-left`}
            x1={nodePos.x}
            y1={nodePos.y + 20}
            x2={leftPos.x}
            y2={leftPos.y - 20}
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400 dark:text-gray-300"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />,
        )
        connections.push(...renderConnections(node.left, positions))
      }
    }

    if (node.right && nodePos) {
      const rightPos = positions.get(node.right.id)
      if (rightPos) {
        connections.push(
          <motion.line
            key={`${node.id}-right`}
            x1={nodePos.x}
            y1={nodePos.y + 20}
            x2={rightPos.x}
            y2={rightPos.y - 20}
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400 dark:text-gray-300"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />,
        )
        connections.push(...renderConnections(node.right, positions))
      }
    }

    return connections
  }

  const positions = calculateNodePositions(tree)

  return (
    <div className="w-full min-w-[580px] h-[600px] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-black dark:to-black rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Binary Tree Builder</h2>
        <div className="flex items-center gap-2">
          <Button onClick={resetTree} variant="outline" size="sm" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button onClick={toggleTheme} variant="outline" size="sm">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="mt-4 mb-4 text-xs text-gray-600 dark:text-gray-200 bg-white dark:bg-black rounded-lg p-3 border border-gray-200 dark:border-gray-600 transition-colors">
        <p className="font-medium mb-1">How to build:</p>
        <p>
          1. Click any node to make it the root • 2. Next clicks add children left-to-right • 3. Each node can have up
          to 2 children
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-200 mb-3">Available Nodes</h3>
        <div className="grid grid-cols-15 gap-1">
          {availableNodes.map((nodeId) => (
            <motion.button
              key={nodeId}
              onClick={() => handleNodeClick(nodeId)}
              disabled={usedNodes.includes(nodeId)}
              className={`
                w-9 h-9 rounded-lg border-2 font-bold text-sm transition-all
                ${
                  usedNodes.includes(nodeId)
                    ? "bg-gray-200 dark:bg-black border-gray-300 dark:border-gray-500 text-gray-400 dark:text-gray-400 cursor-not-allowed"
                    : "bg-white dark:bg-black border-blue-300 dark:border-blue-400 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-black hover:border-blue-400 dark:hover:border-blue-300 cursor-pointer"
                }
              `}
              whileHover={!usedNodes.includes(nodeId) ? { scale: 1.05 } : {}}
              whileTap={!usedNodes.includes(nodeId) ? { scale: 0.95 } : {}}
            >
              {nodeId}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden min-w-[540px] transition-colors">
        {!tree ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-300">
            <div className="text-center">
              <p className="text-lg font-medium">Click a node to start building your tree</p>
              <p className="text-sm">First click becomes the root</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <AnimatePresence>{renderConnections(tree, positions)}</AnimatePresence>
            </svg>
            <AnimatePresence>
              {Array.from(positions.entries()).map(([nodeId, position]) => (
                <motion.div
                  key={nodeId}
                  className="absolute w-10 h-10 bg-blue-500 dark:bg-blue-400 text-white dark:text-gray-900 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white dark:border-gray-700"
                  style={{ left: position.x - 20, top: position.y - 20 }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: position.level * 0.1,
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  {nodeId}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
