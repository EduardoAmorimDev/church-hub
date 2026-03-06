import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { colors } from '../colors'
import { typography } from '../typography'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function kebabCase(value: string) {
  return value
    .replace(/[A-Z]/g, sub => `-${sub.toLowerCase()}`)
    .replace(/_/g, '-')
    .replace(/(\d+)/g, '-$1')
    .replace(/^-/, '')
}

type TokenValue = string | number | { [key: string]: TokenValue }

function collectVariables(
  value: TokenValue,
  pathParts: string[],
  variables: Array<{ nameParts: string[]; value: string }>,
  numberUnit: string
) {
  if (typeof value === 'string') {
    variables.push({ nameParts: pathParts, value })
    return
  }

  if (typeof value === 'number') {
    variables.push({
      nameParts: pathParts,
      value: `${value}${numberUnit}`
    })
    return
  }

  for (const [key, nested] of Object.entries(value)) {
    collectVariables(nested, [...pathParts, key], variables, numberUnit)
  }
}

function buildCssFile(
  tokensList: Array<{
    tokens: TokenValue
    prefix?: string[]
    numberUnit?: string
  }>
) {
  const variables: Array<{ nameParts: string[]; value: string }> = []

  for (const { tokens, prefix, numberUnit } of tokensList) {
    collectVariables(tokens, prefix ?? [], variables, numberUnit ?? '')
  }

  let line = ''
  line += '/* AUTO-GENERATED. DO NOT EDIT. */\n'
  line += ':root {\n'

  for (const variable of variables) {
    const name = variable.nameParts.map(part => kebabCase(part)).join('-')
    line += `  --${name}: ${variable.value};\n`
  }

  line += '}'
  return line
}

function writeCssFile(contents: string) {
  const filePath = path.join(__dirname, '../../dist/styles/root.css')

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, contents, 'utf8')
  console.log('Wrote', filePath)
}

writeCssFile(
  buildCssFile([
    { tokens: colors },
    { tokens: typography, prefix: ['typography'], numberUnit: 'px' }
  ])
)
