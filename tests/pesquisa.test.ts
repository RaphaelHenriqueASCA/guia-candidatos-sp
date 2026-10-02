import { describe, expect, it } from 'vitest'
import { buscar, porId } from '../src/lib/dados'
import { IAS, pedidoDePesquisa, urlFeedback, urlNoticias } from '../src/lib/pesquisa'

const p = porId('estadual-50300')!

describe('pesquisa sob demanda', () => {
  it('a busca de notícias leva só o nome do candidato, nunca os valores da pessoa', () => {
    const u = decodeURIComponent(urlNoticias(p))
    expect(u).toContain('Keit Lima')
    expect(u).not.toMatch(/educacao|-80/)
    expect(urlNoticias(p)).toMatch(/^https:\/\/news\.google\.com\/search\?q=/)
  })
  it('o pedido inclui as áreas citadas com a posição, e áreas padrão se nada foi citado', () => {
    const t = pedidoDePesquisa(p, { educacao: -80, transporte: 60 })
    expect(t).toContain('Educação: -80')
    expect(t).toContain('Transporte e mobilidade: 60')
    expect(t).toContain('Keit Lima')
    expect(pedidoDePesquisa(p, {})).toContain('educação, família')
  })
})

describe('pesquisa em IAs gratuitas', () => {
  const pedido = pedidoDePesquisa(p, { educacao: -80 })
  it('o pedido não menciona nenhuma IA específica', () => {
    expect(pedido).not.toMatch(/claude|chatgpt|gemini|deepseek|perplexity/i)
  })
  it('IAs com link abrem já com o pedido codificado; as demais só abrem o site', () => {
    for (const ia of IAS) {
      const u = ia.url(pedido)
      if (ia.modo === 'link') expect(u).toContain(encodeURIComponent('Keit Lima'))
      else expect(u).not.toContain('?')
    }
    expect(IAS.map((i) => i.nome)).toEqual(expect.arrayContaining(['Gemini', 'DeepSeek', 'Perplexity', 'ChatGPT']))
  })
})

describe('busca de candidato', () => {
  it('acha por nome (sem acento), por número e por partido', () => {
    expect(buscar('keit lima')[0].id).toBe('estadual-50300')
    expect(buscar('50300').some((x) => x.id === 'estadual-50300')).toBe(true)
    expect(buscar('gregory franca').some((x) => x.id === 'federal-1300')).toBe(true)
    expect(buscar('psol', 20).every((x) => x.partido === 'PSOL')).toBe(true)
    expect(buscar('')).toEqual([])
  })
})

describe('feedback por e-mail', () => {
  it('abre o programa de e-mail com assunto e corpo, e informa o candidato quando é erro de ficha', () => {
    const geral = urlFeedback()!
    expect(geral).toMatch(/^mailto:[^?]+\?subject=/)
    const erro = decodeURIComponent(urlFeedback('Keit Lima (PSOL 50300)', 'https://exemplo/#/candidato/estadual-50300')!)
    expect(erro).toContain('Erro na ficha: Keit Lima')
    expect(erro).toContain('https://exemplo/#/candidato/estadual-50300')
  })
})
