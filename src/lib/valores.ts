import { DEFS } from './areas'
import type { Area } from './schema'

/** Remove caracteres de controle/HTML e limita o tamanho. O texto nunca é enviado a lugar nenhum. */
export function sanitizar(texto: string, max = 1500): string {
  return texto
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .slice(0, max)
}

/** Minúsculas, sem acento e com hífens viram espaço (ex.: cívico-militar → civico militar). */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[-–—]/g, ' ')
}

type Termo = { re: RegExp; flip: boolean }
const compilar = (t: string): Termo => ({ re: new RegExp(`\\b(?:${t.replace(/^~/, '')})\\b`, 'g'), flip: t.startsWith('~') })

const LEX = DEFS.map((d) => ({
  id: d.id,
  palavras: new RegExp(`\\b(?:${d.palavras})\\b`),
  prog: d.prog.map(compilar),
  cons: d.cons.map(compilar),
}))

const NEGACAO = /(?:contra|fim d[aeo]s?|nao (?:apoio|defendo|quero|concordo com|gosto d[aeo]s?))\s+(?:(?:o|a|os|as|de|da|do|das|dos)\s+)?$/
const MARCA_PROG = /\b(?:progressist\w*|de esquerda|esquerdist\w*)\b/
const MARCA_CONS = /\b(?:conservador\w*|de direita|direitist\w*)\b/
const FORTE = /\b(?:muito|totalmente|extremamente|radical\w*|absolutamente|fortemente)\b/
const FRACO = /\b(?:um pouco|mais ou menos|moderad\w*|talvez|em parte)\b/

const FORA_DE_ESCOPO: Record<string, RegExp> = {
  corrupção: /\b(?:corrupcao|corrupt\w*|honest\w*|etica)\b/,
  cultura: /\b(?:cultura\w*|arte|artistas?)\b/,
  esporte: /\b(?:esportes?|esportiv\w*)\b/,
  moradia: /\b(?:moradia\w*|habitacao|aluguel)\b/,
  tecnologia: /\b(?:tecnologia\w*|internet|inovacao)\b/,
}

/** Divide por pontuação/quebras de linha e depois por conectores. */
export function dividirTrechos(texto: string): string[] {
  const limpo = sanitizar(texto).replace(/\b(homem|homens|pais) e (mulher|mulheres|maes)\b/gi, '$1_e_$2')
  const trechos: string[] = []
  for (const frase of limpo.split(/[.;!?\n\r]+/)) {
    const partes = frase.split(/,\s*e\s+|\s+e\s+|\s+mas\s+|\s+além de\s+|\s+alem de\s+|\s+também\s+|\s+tambem\s+|,/i)
    for (const p of partes) {
      const t = p.replace(/_e_/g, ' e ').trim()
      if (t.length > 1) trechos.push(t)
    }
  }
  return trechos
}

export type PosicaoEstimada = {
  /** -100 progressista … +100 conservador; 0 quando falou da área mas não deu para saber o lado */
  pos: number
  semLado: boolean
  evidencias: string[]
}

export type Analise = {
  areas: Partial<Record<Area, PosicaoEstimada>>
  foraDeEscopo: string[]
  nenhum: boolean
}

const arredonda = (n: number) => Math.max(-100, Math.min(100, Math.round(n / 5) * 5))

export function analisarValores(texto: string): Analise {
  const liquido: Partial<Record<Area, number>> = {}
  const evid: Partial<Record<Area, string[]>> = {}
  const ladoVisto = new Set<Area>()
  const fora = new Set<string>()

  for (const trecho of dividirTrechos(texto)) {
    const n = normalizar(trecho)
    const mult = FRACO.test(n) ? 0.5 : FORTE.test(n) ? 1.5 : 1
    const marca = MARCA_PROG.test(n) ? -1 : MARCA_CONS.test(n) ? 1 : 0

    for (const area of LEX) {
      let net = 0
      let achou = false
      for (const [lado, lista] of [[-1, area.prog], [1, area.cons]] as const) {
        for (const t of lista) {
          t.re.lastIndex = 0
          for (let m = t.re.exec(n); m; m = t.re.exec(n)) {
            achou = true
            const antes = n.slice(Math.max(0, m.index - 30), m.index)
            const inverte = t.flip && NEGACAO.test(antes)
            net += (inverte ? -lado : lado) * mult
            ladoVisto.add(area.id)
          }
        }
      }
      const falouDaArea = achou || area.palavras.test(n)
      if (!falouDaArea) continue
      if (!achou && marca !== 0) {
        net += marca * mult
        ladoVisto.add(area.id)
      }
      liquido[area.id] = (liquido[area.id] ?? 0) + net
      ;(evid[area.id] ??= []).push(trecho)
    }
    for (const [tema, re] of Object.entries(FORA_DE_ESCOPO)) if (re.test(n)) fora.add(tema)
  }

  const areas: Analise['areas'] = {}
  for (const area of LEX) {
    const e = evid[area.id]
    if (!e) continue
    areas[area.id] = {
      pos: arredonda((liquido[area.id] ?? 0) * 45),
      semLado: !ladoVisto.has(area.id),
      evidencias: e,
    }
  }
  return { areas, foraDeEscopo: [...fora], nenhum: Object.keys(areas).length === 0 }
}
