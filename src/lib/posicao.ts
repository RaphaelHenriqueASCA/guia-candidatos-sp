import partidosBruto from '../../data/partidos.json'
import { AREAS, partidosSchema, type Area, type Candidato } from './schema'

export const partidos = partidosSchema.parse(partidosBruto)

/** Posição -100 (progressista) … 0 (neutro) … +100 (conservador) só nas áreas que a pessoa citou. */
export type Valores = Partial<Record<Area, number>>

/** Peso de uma área que a pessoa não citou (ela conta como neutra, mas pesa pouco). */
export const PESO_NAO_CITADA = 0.25

export type Posicao = { valor: number; base: 'curadoria' | 'partido'; nota?: string }

/** Escala 0–10 (esquerda→direita) vira -100…+100. */
export function posicaoDoPartido(sigla: string): number | null {
  const lr = partidos.partidos[sigla.toUpperCase()]?.lr
  return lr === null || lr === undefined ? null : Math.round((lr - 5) * 20)
}

export type ComPosicao = { partido: string; posicoes?: Candidato['posicoes'] }

/** Posição da curadoria, se houver; senão a estimada pelo partido; senão nenhuma. */
export function posicaoCandidato(p: ComPosicao, area: Area): Posicao | null {
  const own = p.posicoes?.[area]
  if (own) return { valor: own.valor, base: 'curadoria', nota: own.nota }
  const v = posicaoDoPartido(p.partido)
  return v === null ? null : { valor: v, base: 'partido' }
}

export function citadas(v: Valores): Area[] {
  return AREAS.filter((a) => v[a] !== undefined)
}

/**
 * Afinidade 0–100: 100 menos a distância média ponderada entre a pessoa e o candidato.
 * Áreas citadas pesam 1; as não citadas contam como neutras (0) com peso baixo.
 * Devolve null se nada foi citado ou o candidato não tem posição em nenhuma área.
 */
export function afinidade(p: ComPosicao, v: Valores): number | null {
  if (citadas(v).length === 0) return null
  let soma = 0
  let pesos = 0
  for (const a of AREAS) {
    const c = posicaoCandidato(p, a)
    if (!c) continue
    const u = v[a] ?? 0
    const w = v[a] === undefined ? PESO_NAO_CITADA : 1
    soma += w * (Math.abs(u - c.valor) / 200)
    pesos += w
  }
  return pesos === 0 ? null : Math.round(100 * (1 - soma / pesos))
}

export function valoresParaQuery(v: Valores): string {
  return citadas(v)
    .map((a) => `${a}:${v[a]}`)
    .join(',')
}

export function valoresDeQuery(s: string | null): Valores {
  const out: Valores = {}
  if (!s) return out
  for (const par of s.split(',')) {
    const [a, n] = par.split(':')
    const num = Number(n)
    if ((AREAS as readonly string[]).includes(a) && Number.isFinite(num) && num >= -100 && num <= 100) {
      out[a as Area] = Math.round(num)
    }
  }
  return out
}
