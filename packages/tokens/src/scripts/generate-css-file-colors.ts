import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { colors } from '../colors'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function kebabCase(value: string) {
  return value
    .replace(/[A-Z]/g, sub => `-${sub.toLowerCase()}`)
    .replace(/_/g, '-')
    .replace(/(\d+)/g, '-$1')
    .replace(/^-/, '')
}

let line = ''
line += '/* AUTO-GENERATED. DO NOT EDIT. */\n'
line += ':root {\n'

for (const [key, value] of Object.entries(colors)) {
  line += `  --${kebabCase(key)}: ${value};\n`
}

line += '}'

const dir = path.join(__dirname, '../../dist/styles/colors.css')
fs.mkdirSync(path.dirname(dir), { recursive: true })
fs.writeFileSync(dir, line, 'utf8')

console.log('Wrote', dir)
