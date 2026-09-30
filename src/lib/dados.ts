import curados from '../../data/candidatos.json'
import tse from '../../data/tse-sp.json'
import { candidatosSchema, tseSchema, type Candidato } from './schema'

const listaCurada = candidatosSchema.parse(curados)
const listaTse = tseSchema.parse(tse)

/** Qualquer candidato a deputado federal/estadual de SP (dados do TSE); `curado` só existe para os pesquisados. */
export type Pessoa = {
  id: string
  cargo: 'federal' | 'estadual'
  numero: string
  nomeUrna: string
  partido: string
  posicoes?: Candidato['posicoes']
  curado?: Candidato
}

const curadoPorId = new Map(listaCurada.map((c) => [c.id, c]))

export const pessoas: Pessoa[] = listaTse.map((t) => {
  const c = curadoPorId.get(t.id)
  return c
    ? { id: t.id, cargo: t.cargo, numero: t.numero, nomeUrna: c.nomeUrna, partido: c.partido, posicoes: c.posicoes, curado: c }
    : t
})

export const curadosLista: Pessoa[] = pessoas.filter((p) => p.curado)

const porIdMap = new Map(pessoas.map((p) => [p.id, p]))
export function porId(id: string): Pessoa | undefined {
  return porIdMap.get(id)
}

export function urlFoto(id: string): string {
  return `${import.meta.env.BASE_URL}fotos/${id}.jpg`
}

export function iniciais(nome: string): string {
  const p = nome.split(/\s+/).filter((x) => x.length > 2 || /^[A-Z]/.test(x))
  return ((p[0]?.[0] ?? '?') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase()
}

export function formatarData(iso: string): string {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

/** Nome do TSE vem em maiúsculas; deixa legível sem mexer em siglas curtas. */
export function nomeLegivel(nome: string): string {
  if (nome !== nome.toUpperCase()) return nome
  return nome
    .toLowerCase()
    .split(' ')
    .map((p) => (['de', 'da', 'do', 'das', 'dos', 'e'].includes(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
}
