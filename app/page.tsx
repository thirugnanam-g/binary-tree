import TreeBuilder from "./tree-builder"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-black transition-colors p-4">
      <TreeBuilder />
    </main>
  )
}
