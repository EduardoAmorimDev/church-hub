const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/dist/metro/index.js')
const { resolve } = require('path')

const workspaceRoot = resolve(__dirname, '../..')
const projectRoot = __dirname

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  resolve(projectRoot, 'node_modules'),
  resolve(workspaceRoot, 'node_modules')
]
config.resolver.disableHierarchicalLookup = true

module.exports = withNativeWind(config)
