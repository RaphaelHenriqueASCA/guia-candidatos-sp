/**
 * sync:tse — confirma nome de urna, número, cargo e UF de cada candidato e baixa a foto oficial.
 *
 * Fonte: dados abertos do TSE (https://dadosabertos.tse.jus.br/dataset/candidatos-2026):
 *   - consulta_cand_2026.zip  (CSV por UF; colunas SQ_CANDIDATO, NR_CANDIDATO, NM_URNA_CANDIDATO, DS_CARGO, SG_PARTIDO...)
 *   - foto_cand2026_SP_div.zip (JPEGs nomeados F{UF}{SQ_CANDIDATO}_div.jpg)
 * A API DivulgaCandContas foi testada e bloqueia acesso automatizado (Akamai "Access Denied"),
 * por isso usamos os arquivos de dados abertos. Os zips ficam em .cache/ (fora do git).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import AdmZip from 'adm-zip'
import { parse } from 'csv-parse/sync'
import { candidatosSchema } from '../src/lib/schema'

const UF = 'SP'
const BASE = 'https://cdn.tse.jus.br/estatistica/sead'
const URL_CAND = `${BASE}/odsele/consulta_cand/consulta_cand_2026.zip`
const URL_FOTOS = `${BASE}/eleicoes/eleicoes2026/fotos/foto_cand2026_${UF}_div.zip`
const CARGO_TSE: Record<string, string> = { federal: 'DEPUTADO FEDERAL', estadual: 'DEPUTADO ESTADUAL' }

const raiz = new URL('../', import.meta.url)
const cache = new URL('.cache/', raiz)
mkdirSync(cache, { recursive: true })
mkdirSync(new URL('public/fotos/', raiz), { recursive: true })

const args = new Set(process.argv.slice(2))
const semAtualizarCache = args.has('--offline')

async function baixar(url: string, nome: string): Promise<Buffer> {
  const destino = new URL(nome, cache)
  if (semAtualizarCache && existsSync(destino)) return readFileSync(destino)
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 GuiaCandidatosSP' }, signal: AbortSignal.timeout(180000) })
  if (!r.ok) throw new Error(`Falha ao baixar ${url}: HTTP ${r.status}`)
  const buf = Buffer.from(await r.arrayBuffer())
  writeFileSync(destino, buf)
  return buf
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim()

const candidatos = candidatosSchema.parse(JSON.parse(readFileSync(new URL('data/candidatos.json', raiz), 'utf8')))

console.log('Baixando cadastro de candidatos do TSE (dados abertos)...')
const zipCand = new AdmZip(await baixar(URL_CAND, 'consulta_cand_2026.zip'))
const entrada = zipCand.getEntry(`consulta_cand_2026_${UF}.csv`)
if (!entrada) throw new Error(`CSV de ${UF} não encontrado no zip do TSE`)
const linhas = parse(entrada.getData().toString('latin1'), { columns: true, delimiter: ';', relax_quotes: true, skip_empty_lines: true }) as Record<string, string>[]

console.log('Baixando fotos oficiais...')
const zipFotos = new AdmZip(await baixar(URL_FOTOS, `foto_cand2026_${UF}_div.zip`))

// Julgamento do registro de candidatura (historico_candidatura) e motivos de indeferimento (motivo_cassacao).
// "Inelegibilidade infraconstitucional (LC 64/90)" é o enquadramento da Lei da Ficha Limpa.
console.log('Baixando situação do registro e motivos de indeferimento...')
const lerCsv = (zip: AdmZip, nome: string) => {
  const e = zip.getEntry(nome)
  if (!e) return [] as Record<string, string>[]
  return parse(e.getData().toString('latin1'), { columns: true, delimiter: ';', relax_quotes: true, skip_empty_lines: true }) as Record<string, string>[]
}
const hist = lerCsv(new AdmZip(await baixar(`${BASE}/odsele/historico_candidatura/historico_candidatura_2026.zip`, 'historico_candidatura.zip')), `historico_candidatura_2026_${UF}.csv`)
const motivos = lerCsv(new AdmZip(await baixar(`${BASE}/odsele/motivo_cassacao/motivo_cassacao_2026.zip`, 'motivo_cassacao.zip')), `motivo_cassacao_2026_${UF}.csv`)
const CODIGO_JG: Record<string, string> = {
  Deferido: 'deferido',
  'Deferido em prazo recursal ou com recurso': 'deferido_recurso',
  Indeferido: 'indeferido',
  'Indeferido em prazo recursal ou com recurso': 'indeferido_recurso',
  Renúncia: 'renuncia',
}
const julgamento = new Map<string, string>()
for (const r of hist) if (r.ANO_ELEICAO === '2026' && CODIGO_JG[r.DS_SITUACAO_JULGAMENTO]) julgamento.set(r.SQ_CANDIDATO, CODIGO_JG[r.DS_SITUACAO_JULGAMENTO])
const fichaLimpa = new Set<string>()
for (const r of motivos) if (/infraconstitucional/i.test(r.DS_MOTIVO)) fichaLimpa.add(r.SQ_CANDIDATO)
function marcaFichaLimpa(sq: string): 'barrado' | 'em_recurso' | 'citado' | undefined {
  if (!fichaLimpa.has(sq)) return undefined
  const j = julgamento.get(sq)
  return j === 'indeferido' ? 'barrado' : j === 'indeferido_recurso' ? 'em_recurso' : 'citado'
}

// Todos os candidatos a deputado federal/estadual de SP (sem CPF, e-mail ou outros dados pessoais): base do ranking por valores.
type Linha = { id: string; cargo: 'federal' | 'estadual'; numero: string; nomeUrna: string; partido: string; jg?: string; fl?: 'barrado' | 'em_recurso' | 'citado' }
const brutos: (Linha & { sq: string })[] = []
for (const l of linhas) {
  const cargo = l.DS_CARGO === CARGO_TSE.federal ? 'federal' : l.DS_CARGO === CARGO_TSE.estadual ? 'estadual' : null
  if (!cargo || l.SG_UF !== UF) continue
  brutos.push({ id: `${cargo}-${l.NR_CANDIDATO}`, cargo, numero: l.NR_CANDIDATO, nomeUrna: l.NM_URNA_CANDIDATO, partido: l.SG_PARTIDO, sq: l.SQ_CANDIDATO })
}
// Em poucos casos o TSE lista duas pessoas com o mesmo número/cargo (ex.: substituição). Como o site identifica por cargo+número,
// esses números ficam de fora (melhor omitir do que atribuir foto ou posição à pessoa errada).
const contagem = new Map<string, number>()
for (const b of brutos) contagem.set(b.id, (contagem.get(b.id) ?? 0) + 1)
const repetidos = [...contagem].filter(([, n]) => n > 1).map(([id]) => id)
const todos: Linha[] = []
let fotosTodas = 0
for (const { sq, ...b } of brutos) {
  if (repetidos.includes(b.id)) continue
  const jg = julgamento.get(sq)
  const fl = marcaFichaLimpa(sq)
  todos.push({ ...b, ...(jg ? { jg } : {}), ...(fl ? { fl } : {}) })
  const f = zipFotos.getEntry(`F${UF}${sq}_div.jpg`)
  if (f) {
    writeFileSync(new URL(`public/fotos/${b.id}.jpg`, raiz), f.getData())
    fotosTodas++
  }
}
todos.sort((a, b) => a.id.localeCompare(b.id))
writeFileSync(new URL('data/tse-sp.json', raiz), JSON.stringify(todos))
console.log(`TSE ${UF}: ${todos.length} candidatos a deputado; ${fotosTodas} fotos salvas.`)
const comFl = todos.filter((t) => t.fl)
console.log(`Ficha Limpa (LC 64/90) nos registros: ${comFl.length} (barrados: ${comFl.filter((t) => t.fl === 'barrado').length}, em recurso: ${comFl.filter((t) => t.fl === 'em_recurso').length}, citados: ${comFl.filter((t) => t.fl === 'citado').length}).`)
if (repetidos.length) console.warn(`Números repetidos no TSE, omitidos: ${repetidos.join(', ')}`)

const divergencias: string[] = []
const semFoto: string[] = []
let fotos = 0

for (const c of candidatos) {
  const achados = linhas.filter((l) => l.DS_CARGO === CARGO_TSE[c.cargo] && l.NR_CANDIDATO === c.numero && l.SG_UF === UF)
  if (achados.length === 0) {
    divergencias.push(`${c.nomeUrna} (${c.cargo} ${c.numero}): número não encontrado no TSE para ${UF}`)
    continue
  }
  const l = achados[0]
  if (achados.length > 1) {
    divergencias.push(`${c.nomeUrna} (${c.cargo} ${c.numero}): ${achados.length} registros para o mesmo número`)
    continue
  }
  if (norm(l.NM_URNA_CANDIDATO) !== norm(c.nomeUrna)) {
    divergencias.push(`${c.cargo} ${c.numero}: nome de urna no JSON é "${c.nomeUrna}", no TSE é "${l.NM_URNA_CANDIDATO}"`)
  }
  if (norm(l.SG_PARTIDO) !== norm(c.partido)) {
    divergencias.push(`${c.nomeUrna} (${c.numero}): partido no JSON é "${c.partido}", no TSE é "${l.SG_PARTIDO}"`)
  }
  console.log(`  ${c.nomeUrna.padEnd(32)} ${c.numero}  TSE: ${l.NM_URNA_CANDIDATO} · ${l.SG_PARTIDO} · ${l.DS_SITUACAO_CANDIDATURA}`)

  const foto = zipFotos.getEntry(`F${UF}${l.SQ_CANDIDATO}_div.jpg`)
  if (foto) {
    writeFileSync(new URL(`public/fotos/${c.id}.jpg`, raiz), foto.getData())
    fotos++
  } else {
    semFoto.push(`${c.nomeUrna} (${c.id})`)
  }
}

console.log(`\nFotos salvas: ${fotos}/${candidatos.length}.`)
if (semFoto.length) console.warn(`Sem foto oficial (o site usará avatar com iniciais): ${semFoto.join(', ')}`)
if (divergencias.length) {
  console.error('\n✗ DIVERGÊNCIAS com o TSE — corrija data/candidatos.json antes de publicar:')
  for (const d of divergencias) console.error('  - ' + d)
  process.exit(1)
}
console.log('✓ Nomes de urna, números e partidos conferem com o TSE.')
