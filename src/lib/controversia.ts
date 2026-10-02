import type { FichaLimpa, Ocorrencia, Situacao, TipoOcorrencia } from './schema'

/**
 * Índice de controvérsias (0–100): resume o que foi encontrado sobre processos e investigações de um candidato.
 * Não é um julgamento: vale a presunção de inocência. Mede só o que foi pesquisado e tem fonte.
 *
 * Cada ocorrência recebe um peso de 0 a 100 conforme a gravidade e o estágio; ocorrências antigas pesam menos;
 * as ocorrências são combinadas de modo que nunca passem de 100: indice = 100 × (1 − Π(1 − peso/100)).
 */

export const ANO_BASE = 2026

type Tabela = Partial<Record<Situacao, number>> & { qualquer?: number }

/** Pesos-base por tipo e situação. `arquivada_ou_revertida` sempre pesa 0. */
export const PESOS: Record<TipoOcorrencia, Tabela> = {
  condenacao_criminal: { definitiva: 100, nao_definitiva: 75, em_curso: 75 },
  condenacao_administrativa: { definitiva: 90, nao_definitiva: 70, em_curso: 70 },
  condenacao_civel: { definitiva: 50, nao_definitiva: 40, em_curso: 40 },
  sancao_etica: { definitiva: 30, nao_definitiva: 20, em_curso: 20 },
  acao_em_curso: { qualquer: 45 },
  investigacao: { qualquer: 25 },
  citacao: { qualquer: 10 },
  representacao: { qualquer: 8 },
}

/** Lei da Ficha Limpa (inelegibilidade LC 64/90 no julgamento do registro, dados do TSE). */
export const PESO_FICHA_LIMPA: Record<FichaLimpa, number> = { barrado: 100, em_recurso: 80, citado: 60 }

export const ROTULO_TIPO: Record<TipoOcorrencia, string> = {
  condenacao_criminal: 'Condenação criminal',
  condenacao_administrativa: 'Condenação administrativa / improbidade',
  condenacao_civel: 'Condenação cível',
  sancao_etica: 'Sanção ético-disciplinar',
  acao_em_curso: 'Ação em curso (réu)',
  investigacao: 'Investigação',
  citacao: 'Citação sem investigação formal',
  representacao: 'Representação de terceiros',
}

export const ROTULO_SITUACAO: Record<Situacao, string> = {
  definitiva: 'definitiva',
  nao_definitiva: 'cabe recurso',
  em_curso: 'sem desfecho conhecido',
  arquivada_ou_revertida: 'arquivada, absolvido ou revertida',
}

export const ROTULO_FICHA_LIMPA: Record<FichaLimpa, string> = {
  barrado: 'Registro indeferido por inelegibilidade (Ficha Limpa, LC 64/90)',
  em_recurso: 'Registro indeferido por inelegibilidade (Ficha Limpa, LC 64/90), em recurso',
  citado: 'Citado em inelegibilidade (Ficha Limpa, LC 64/90) em seu registro; sem julgamento final publicado',
}

/** Ocorrências antigas pesam menos: até 10 anos, 100%; de 10 a 20, 50%; acima de 20, 25%. */
export function fatorIdade(ano: number, base = ANO_BASE): number {
  const idade = base - ano
  return idade <= 10 ? 1 : idade <= 20 ? 0.5 : 0.25
}

export function pesoBase(o: Pick<Ocorrencia, 'tipo' | 'situacao'>): number {
  if (o.situacao === 'arquivada_ou_revertida') return 0
  const t = PESOS[o.tipo]
  return t[o.situacao] ?? t.qualquer ?? 0
}

export type ItemControversia = {
  rotulo: string
  detalhe: string
  situacao: string
  ano?: number
  fonte?: string
  /** peso depois do ajuste por idade, 0–100 */
  peso: number
  origem: 'pesquisa' | 'tse'
}

export type Controversia = {
  /** null = não há como calcular (candidato sem pesquisa e sem registro em análise no TSE) */
  indice: number | null
  itens: ItemControversia[]
  pesquisado: boolean
}

export function combinar(pesos: number[]): number {
  const livre = pesos.reduce((p, w) => p * (1 - Math.min(100, Math.max(0, w)) / 100), 1)
  return Math.round(100 * (1 - livre))
}

export function calcularControversia(entrada: { ocorrencias?: Ocorrencia[]; fl?: FichaLimpa; pesquisado: boolean }): Controversia {
  const itens: ItemControversia[] = []
  if (entrada.fl) {
    itens.push({
      rotulo: ROTULO_FICHA_LIMPA[entrada.fl],
      detalhe: 'Informação do TSE (julgamento do registro de candidatura de 2026). Pode haver recurso.',
      situacao: entrada.fl === 'barrado' ? 'registro indeferido' : entrada.fl === 'em_recurso' ? 'em recurso' : 'sem julgamento final',
      peso: PESO_FICHA_LIMPA[entrada.fl],
      origem: 'tse',
    })
  }
  for (const o of entrada.ocorrencias ?? []) {
    itens.push({
      rotulo: ROTULO_TIPO[o.tipo],
      detalhe: o.descricao,
      situacao: ROTULO_SITUACAO[o.situacao],
      ano: o.ano,
      fonte: o.fonte,
      peso: Math.round(pesoBase(o) * fatorIdade(o.ano) * 10) / 10,
      origem: 'pesquisa',
    })
  }
  itens.sort((a, b) => b.peso - a.peso)
  if (!entrada.pesquisado && !entrada.fl) return { indice: null, itens, pesquisado: false }
  return { indice: combinar(itens.map((i) => i.peso)), itens, pesquisado: entrada.pesquisado }
}

export function rotuloIndice(indice: number | null): string {
  if (indice === null) return 'Não pesquisado'
  if (indice === 0) return 'Nenhuma ocorrência encontrada'
  if (indice < 20) return 'Baixo'
  if (indice < 50) return 'Moderado'
  if (indice < 80) return 'Alto'
  return 'Muito alto'
}
