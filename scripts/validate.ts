import { readFileSync } from 'node:fs'
import { candidatosSchema, tseSchema } from '../src/lib/schema'
import { partidos } from '../src/lib/posicao'
import { validarSemantica } from '../src/lib/validacao'

const ler = (p: string) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'))
const r = candidatosSchema.safeParse(ler('../data/candidatos.json'))

if (!r.success) {
  console.error('✗ Schema inválido em data/candidatos.json:')
  for (const i of r.error.issues) console.error(`  - [${i.path.join('.')}] ${i.message}`)
  process.exit(1)
}

const problemas = validarSemantica(r.data)

const tse = tseSchema.safeParse(ler('../data/tse-sp.json'))
if (!tse.success) problemas.push('data/tse-sp.json inválido (rode npm run sync:tse)')
else {
  const ids = new Set(tse.data.map((t) => t.id))
  for (const c of r.data) if (!ids.has(c.id)) problemas.push(`${c.nomeUrna} (${c.id}) não consta em data/tse-sp.json (rode npm run sync:tse)`)
  const sem = [...new Set(tse.data.map((t) => t.partido))].filter((p) => !(p in partidos.partidos))
  if (sem.length) problemas.push(`partidos do TSE ausentes em data/partidos.json: ${sem.join(', ')}`)
}

if (problemas.length) {
  console.error('✗ Problemas de conteúdo:')
  for (const p of problemas) console.error('  - ' + p)
  process.exit(1)
}

console.log(`✓ ${r.data.length} candidatos pesquisados válidos; ${tse.success ? tse.data.length : 0} candidatos do TSE; partidos conferidos.`)
