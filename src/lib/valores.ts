import { CRITERIOS, type Criterio } from './schema'
import { normalizarPesos, type Pesos } from './nota'

/** Remove caracteres de controle/HTML e limita o tamanho. O texto nunca é enviado a lugar nenhum. */
export function sanitizar(texto: string, max = 1500): string {
  return texto
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .slice(0, max)
}

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

// Dicionário local (não é IA). Padrões aplicados ao texto sem acento e em minúsculas.
const DICIONARIO: Record<Criterio, RegExp> = {
  educacao:
    /\b(educacao|escola\w*|professor\w*|ensino|alfabetizacao|universidade\w*|estudante\w*|alun[oa]s?|creche\w*|merenda|magisterio|docente\w*|faculdade\w*|letramento)\b/,
  minorias:
    /\b(minoria\w*|negr[oa]s?|pret[oa]s?|mulher\w*|lgbt\w*|gays?|lesbica\w*|trans|transgener\w*|transexua\w*|transfobia|homofobia|deficien\w*|pcd|racismo|racista\w*|indigena\w*|quilombola\w*|machismo|misoginia|inclusao|diversidade|igualdade racial)\b/,
  periferia:
    /\b(periferia\w*|periferic\w*|favela\w*|comunidade\w*|projetos? sociais?|popular\w*|populares|quebrada\w*|povo|origem humilde|coletivo\w*|movimentos? sociais?|zona (leste|sul|norte)|bairro\w*)\b/,
  midia:
    /\b(discret[oa]s?|pouco midiatic\w*|sem holofote\w*|sem exposicao|baixa exposicao|pouco conhecid\w*|longe da midia|low profile|sem fama|reservad[oa])\b/,
}

const FORA_DE_ESCOPO: Record<string, RegExp> = {
  saúde: /\b(saude|sus|hospital\w*|medic\w*)\b/,
  segurança: /\b(seguranca|policia\w*|violencia|crime\w*|armas?)\b/,
  economia: /\b(economia|imposto\w*|emprego\w*|salario\w*|inflacao|renda)\b/,
  'meio ambiente': /\b(meio ambiente|ambiental|clima|desmatamento)\b/,
  transporte: /\b(transporte\w*|onibus|metro|mobilidade)\b/,
  moradia: /\b(moradia\w*|habitacao|aluguel)\b/,
  corrupção: /\b(corrupcao|corrupt\w*|honest\w*|etica)\b/,
  religião: /\b(religia\w*|igreja\w*|evangelic\w*|catolic\w*)\b/,
}

const ENFASE =
  /\b(mais importante|prioridade|prioritari\w*|principalmente|sobretudo|fundamental|essencial|acima de tudo|antes de tudo)\b/
const DESDEM = /\b(nao me importo|tanto faz|nao ligo|nao importa|nao faz diferenca|nao e importante)\b/

/** Divide por pontuação/quebras de linha e depois por conectores. */
export function dividirTrechos(texto: string): string[] {
  const limpo = sanitizar(texto)
  const trechos: string[] = []
  for (const frase of limpo.split(/[.;!?\n\r]+/)) {
    // a divisão usa uma cópia sem acento apenas para localizar conectores; o texto original é preservado
    const partes = frase.split(/,\s*e\s+|\s+e\s+|\s+mas\s+|\s+além de\s+|\s+alem de\s+|\s+também\s+|\s+tambem\s+|,/i)
    for (const p of partes) {
      const t = p.trim()
      if (t.length > 1) trechos.push(t)
    }
  }
  return trechos
}

export type Analise = {
  pesos: Pesos // soma 100, ou tudo 0 se nada foi detectado
  evidencias: Record<Criterio, string[]> // trechos que acionaram cada critério
  foraDeEscopo: string[]
  nenhum: boolean
}

export function analisarValores(texto: string): Analise {
  const brutos: Pesos = { educacao: 0, minorias: 0, periferia: 0, midia: 0 }
  const evidencias: Record<Criterio, string[]> = { educacao: [], minorias: [], periferia: [], midia: [] }
  const fora = new Set<string>()

  for (const trecho of dividirTrechos(texto)) {
    const n = normalizar(trecho)
    const mult = DESDEM.test(n) ? 0.3 : ENFASE.test(n) ? 2 : 1
    for (const c of CRITERIOS) {
      if (DICIONARIO[c].test(n)) {
        brutos[c] += mult
        evidencias[c].push(trecho)
      }
    }
    for (const [tema, re] of Object.entries(FORA_DE_ESCOPO)) if (re.test(n)) fora.add(tema)
  }

  const nenhum = CRITERIOS.every((c) => brutos[c] === 0)
  return { pesos: nenhum ? brutos : normalizarPesos(brutos), evidencias, foraDeEscopo: [...fora], nenhum }
}
