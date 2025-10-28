// Learn more https://docs.expo.io/guides/customizing-metro
import { getDefaultConfig } from 'expo/metro-config.js'
import { withNativewind } from 'nativewind/metro'
import { resolve } from 'path'

// Find the workspace root, this can be replaced with `find-yarn-workspace-root`
const workspaceRoot = resolve(__dirname, '../..')
const projectRoot = __dirname

const config = getDefaultConfig(projectRoot)

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot]
// 2. Let Metro know where to resolve packages, and in what order
config.resolver.nodeModulesPaths = [
  resolve(projectRoot, 'node_modules'),
  resolve(workspaceRoot, 'node_modules')
]
// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true

export default withNativewind(config)
