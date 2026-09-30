import { readFileSync } from 'node:fs'
import { candidatosSchema } from '../src/lib/schema'
import { validarSemantica } from '../src/lib/validacao'

const arquivo = new URL('../data/candidatos.json', import.meta.url)
const bruto = JSON.parse(readFileSync(arquivo, 'utf8'))
const r = candidatosSchema.safeParse(bruto)

if (!r.success) {
  console.error('✗ Schema inválido em data/candidatos.json:')
  for (const i of r.error.issues) console.error(`  - [${i.path.join('.')}] ${i.message}`)
  process.exit(1)
}

const problemas = validarSemantica(r.data)
if (problemas.length) {
  console.error('✗ Problemas de conteúdo:')
  for (const p of problemas) console.error('  - ' + p)
  process.exit(1)
}

console.log(`✓ ${r.data.length} candidatos válidos (schema, fontes com URL e data, critérios).`)
