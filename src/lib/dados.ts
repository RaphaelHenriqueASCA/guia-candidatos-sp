import bruto from '../../data/candidatos.json'
import { candidatosSchema, type Candidato } from './schema'

export const candidatos: Candidato[] = candidatosSchema.parse(bruto)

export function porId(id: string): Candidato | undefined {
  return candidatos.find((c) => c.id === id)
}

export function urlFoto(c: Candidato): string {
  return `${import.meta.env.BASE_URL}fotos/${c.id}.jpg`
}

export function iniciais(nome: string): string {
  const p = nome.split(/\s+/).filter((x) => x.length > 2 || /^[A-Z]/.test(x))
  return ((p[0]?.[0] ?? '?') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase()
}

export function formatarData(iso: string): string {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}
