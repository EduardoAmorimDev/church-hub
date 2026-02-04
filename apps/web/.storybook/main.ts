import type { StorybookConfig } from '@storybook/nextjs'

import { dirname } from 'path'

import { fileURLToPath } from 'url'

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}
const config: StorybookConfig = {
  stories: ['../components/**/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-designs',
    '@storybook/addon-docs',
    '@storybook/addon-themes'
  ],
  framework: getAbsolutePath('@storybook/nextjs')
}
export default config
