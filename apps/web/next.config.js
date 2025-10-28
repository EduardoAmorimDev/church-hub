export const reactStrictMode = true
export function webpack(config) {
  config.resolve.extensions = [
    '.web.js',
    '.web.jsx',
    '.web.ts',
    '.web.tsx',
    ...config.resolve.extensions
  ]
  return config
}
