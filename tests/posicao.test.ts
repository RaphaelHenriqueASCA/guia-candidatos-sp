import { describe, expect, it } from 'vitest'
import { faixa, rotuloAfinidade, rotuloDoc } from '../src/lib/nota'
import { afinidade, PESO_NAO_CITADA, posicaoCandidato, posicaoDoPartido, valoresDeQuery, valoresParaQuery } from '../src/lib/posicao'

describe('posição pelo partido', () => {
  it('PT é progressista, PL é conservador, partido novo não tem classificação', () => {
    expect(posicaoDoPartido('PT')!).toBeLessThan(-30)
    expect(posicaoDoPartido('PL')!).toBeGreaterThan(60)
    expect(posicaoDoPartido('MISSÃO')).toBeNull()
    expect(posicaoDoPartido('XYZ')).toBeNull()
  })
  it('curadoria prevalece sobre o partido, por área', () => {
    const p = { partido: 'PL', posicoes: { educacao: { valor: -50, nota: 'exemplo de nota' } } }
    expect(posicaoCandidato(p, 'educacao')).toMatchObject({ valor: -50, base: 'curadoria' })
    expect(posicaoCandidato(p, 'saude')).toMatchObject({ base: 'partido' })
    expect(posicaoCandidato({ partido: 'MISSÃO' }, 'saude')).toBeNull()
  })
})

describe('afinidade', () => {
  const pt = { partido: 'PT' }
  const pl = { partido: 'PL' }
  it('sem área citada não há afinidade', () => {
    expect(afinidade(pt, {})).toBeNull()
  })
  it('quem pensa igual tem afinidade maior que quem pensa o oposto', () => {
    const v = { educacao: -80 }
    expect(afinidade(pt, v)!).toBeGreaterThan(afinidade(pl, v)!)
  })
  it('é 100 quando a pessoa está exatamente onde o candidato está (áreas não citadas neutras pesam pouco)', () => {
    const c = { partido: 'PT', posicoes: { educacao: { valor: -80, nota: 'nota de teste' } } }
    const a = afinidade(c, { educacao: -80 })!
    expect(a).toBeLessThan(100) // as demais áreas (neutras) distam do PT
    expect(a).toBeGreaterThan(afinidade(c, { educacao: 80 })!)
  })
  it('área não citada conta como neutra com peso baixo', () => {
    expect(PESO_NAO_CITADA).toBeLessThan(1)
    // centrista total em tudo: distância ao PL menor que a de um progressista radical
    const todas = { educacao: 0, familia: 0, seguranca: 0, economia: 0, saude: 0, ambiente: 0, transporte: 0, minorias: 0, religiao: 0 }
    expect(afinidade(pl, todas)!).toBeGreaterThan(0)
  })
  it('candidato sem nenhuma posição devolve null', () => {
    expect(afinidade({ partido: 'MISSÃO' }, { educacao: 10 })).toBeNull()
  })
  it('permanece entre 0 e 100', () => {
    const v = { educacao: -100, familia: 100, seguranca: -100, economia: 100 }
    for (const p of [pt, pl]) {
      const a = afinidade(p, v)!
      expect(a).toBeGreaterThanOrEqual(0)
      expect(a).toBeLessThanOrEqual(100)
    }
  })
})

describe('valores na URL', () => {
  it('ida e volta', () => {
    const v = { educacao: -80, familia: 60 }
    expect(valoresParaQuery(v)).toBe('educacao:-80,familia:60')
    expect(valoresDeQuery(valoresParaQuery(v))).toEqual(v)
  })
  it('descarta áreas desconhecidas e valores inválidos', () => {
    expect(valoresDeQuery('foo:10,educacao:500,saude:abc,transporte:-20')).toEqual({ transporte: -20 })
    expect(valoresDeQuery(null)).toEqual({})
  })
})

describe('faixas e rótulos', () => {
  it('faixas de cor nos limites', () => {
    expect(faixa(39).cor).toBe('vermelho')
    expect(faixa(40).cor).toBe('ambar')
    expect(faixa(69).cor).toBe('ambar')
    expect(faixa(70).cor).toBe('verde')
    expect(faixa(100).hex).toBe('#067647')
  })
  it('rótulos de afinidade e de documentação', () => {
    expect(rotuloAfinidade(10)).toBe('Pouca afinidade')
    expect(rotuloAfinidade(55)).toBe('Afinidade média')
    expect(rotuloAfinidade(90)).toBe('Muita afinidade')
    expect(rotuloDoc(29)).toBe('Pouca fonte')
    expect(rotuloDoc(80)).toBe('Muito bem documentado')
  })
})
