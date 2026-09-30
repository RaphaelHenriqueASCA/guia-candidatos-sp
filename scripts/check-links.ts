import { readFileSync } from 'node:fs'
import { candidatosSchema } from '../src/lib/schema'

const dados = candidatosSchema.parse(JSON.parse(readFileSync(new URL('../data/candidatos.json', import.meta.url), 'utf8')))
const UA = 'Mozilla/5.0 (compatible; GuiaCandidatosSP/1.0; verificacao de links)'

type Res = { candidato: string; titulo: string; url: string; status: string; ok: boolean }

async function testar(url: string): Promise<{ status: string; ok: boolean }> {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'follow', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20000) })
      if (r.ok) return { status: String(r.status), ok: true }
      // alguns sites recusam HEAD ou bloqueiam robôs (403/429): tenta GET e trata 403/429 como "incerto"
      if (method === 'GET') return { status: String(r.status), ok: r.status === 403 || r.status === 429 }
    } catch (e) {
      if (method === 'GET') return { status: (e as Error).name === 'TimeoutError' ? 'timeout' : 'erro de rede', ok: false }
    }
  }
  return { status: 'desconhecido', ok: false }
}

const tarefas = dados.flatMap((c) => c.fontes.map((f) => ({ c: c.nomeUrna, f })))
const resultados: Res[] = []
const fila = [...tarefas]
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let t = fila.shift(); t; t = fila.shift()) {
      const r = await testar(t.f.url)
      resultados.push({ candidato: t.c, titulo: t.f.titulo, url: t.f.url, ...r })
    }
  }),
)

const quebradas = resultados.filter((r) => !r.ok)
const incertas = resultados.filter((r) => r.ok && (r.status === '403' || r.status === '429'))
console.log(`${resultados.length} links testados; ${quebradas.length} quebrados; ${incertas.length} bloquearam robô (403/429, verifique no navegador).`)
for (const r of quebradas) console.log(`✗ [${r.status}] ${r.candidato} — ${r.titulo}\n    ${r.url}`)
for (const r of incertas) console.log(`? [${r.status}] ${r.candidato} — ${r.titulo}\n    ${r.url}`)
process.exit(quebradas.length ? 1 : 0)
