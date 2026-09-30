import { CRITERIOS, type Candidato, type Criterio } from './schema'

export type Pesos = Record<Criterio, number>

export const PESOS_PADRAO: Pesos = { educacao: 40, minorias: 30, periferia: 20, midia: 10 }

export const CRITERIOS_INFO: Record<Criterio, { nome: string; descricao: string }> = {
  educacao: { nome: 'Educação', descricao: 'Educação progressista e respeito aos professores' },
  minorias: { nome: 'Minorias', descricao: 'Empatia com as causas das minorias' },
  periferia: { nome: 'Periferia', descricao: 'Origem na periferia e projetos populares' },
  midia: { nome: 'Baixa exposição', descricao: 'Baixa exposição midiática' },
}

export type Faixa = { cor: 'vermelho' | 'ambar' | 'verde'; hex: string; rotulo: string }

const FAIXAS: Faixa[] = [
  { cor: 'vermelho', hex: '#B42318', rotulo: 'Baixa' },
  { cor: 'ambar', hex: '#B54708', rotulo: 'Média' },
  { cor: 'verde', hex: '#067647', rotulo: 'Alta' },
]

export function faixa(nota: number): Faixa {
  if (nota < 40) return FAIXAS[0]
  if (nota < 70) return FAIXAS[1]
  return FAIXAS[2]
}

export function rotuloCompat(nota: number): string {
  return nota < 40 ? 'Pouco compatível' : nota < 70 ? 'Parcialmente compatível' : 'Muito compatível'
}

export function rotuloDoc(nota: number): string {
  if (nota < 30) return 'Pouca fonte'
  if (nota < 60) return 'Poucas fontes'
  if (nota < 80) return 'Bem documentado'
  return 'Muito bem documentado'
}

/** Renormaliza para somar 100 (ignora pesos negativos). Se tudo for 0, devolve tudo 0. */
export function normalizarPesos(p: Pesos): Pesos {
  const soma = CRITERIOS.reduce((s, c) => s + Math.max(0, p[c]), 0)
  if (soma === 0) return { educacao: 0, minorias: 0, periferia: 0, midia: 0 }
  const bruto = CRITERIOS.map((c) => ({ c, v: (Math.max(0, p[c]) * 100) / soma }))
  const out = Object.fromEntries(bruto.map(({ c, v }) => [c, Math.floor(v)])) as Pesos
  let resto = 100 - CRITERIOS.reduce((s, c) => s + out[c], 0)
  for (const { c } of [...bruto].sort((a, b) => (b.v % 1) - (a.v % 1))) {
    if (resto <= 0) break
    out[c] += 1
    resto -= 1
  }
  return out
}

export function algumAtivo(p: Pesos): boolean {
  return CRITERIOS.some((c) => p[c] > 0)
}

/**
 * Média ponderada só dos critérios ativos (peso > 0) e com dados.
 * Critério "sem dados" fica fora do cálculo; sem nenhum critério com dados devolve null.
 */
export function notaPersonalizada(c: Candidato, pesos: Pesos): number | null {
  let soma = 0
  let total = 0
  for (const k of CRITERIOS) {
    if (pesos[k] <= 0 || c.semDados.includes(k)) continue
    soma += c.criterios[k] * pesos[k]
    total += pesos[k]
  }
  return total === 0 ? null : Math.round(soma / total)
}

export function pesosParaQuery(p: Pesos): string {
  return CRITERIOS.map((c) => p[c]).join(',')
}

export function pesosDeQuery(s: string | null): Pesos | null {
  if (!s) return null
  const n = s.split(',').map((x) => Number(x))
  if (n.length !== 4 || n.some((x) => !Number.isFinite(x) || x < 0 || x > 100)) return null
  const p: Pesos = { educacao: n[0], minorias: n[1], periferia: n[2], midia: n[3] }
  return algumAtivo(p) ? normalizarPesos(p) : null
}

export function ehPadrao(p: Pesos): boolean {
  return CRITERIOS.every((c) => p[c] === PESOS_PADRAO[c])
}
