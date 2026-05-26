import type { StorybookConfig } from '@storybook/nextjs'

import { dirname } from 'path'

import { fileURLToPath } from 'url'

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}
const config: StorybookConfig = {
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-designs'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-themes')
  ],
  framework: getAbsolutePath('@storybook/nextjs'),
  stories: ['../components/**/**/*.stories.@(js|jsx|mjs|ts|tsx)']
}
export default config
