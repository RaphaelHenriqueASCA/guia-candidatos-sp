import { describe, expect, it } from 'vitest'
import { faixa, normalizarPesos, notaPersonalizada, PESOS_PADRAO, pesosDeQuery, pesosParaQuery, rotuloDoc } from '../src/lib/nota'
import type { Candidato } from '../src/lib/schema'

const base = {
  criterios: { educacao: 80, minorias: 60, periferia: 40, midia: 20 },
  semDados: [],
} as unknown as Candidato

describe('média ponderada', () => {
  it('usa pesos padrão 40/30/20/10', () => {
    expect(notaPersonalizada(base, PESOS_PADRAO)).toBe(Math.round(0.4 * 80 + 0.3 * 60 + 0.2 * 40 + 0.1 * 20))
  })
  it('critério único = nota desse critério', () => {
    expect(notaPersonalizada(base, { educacao: 0, minorias: 100, periferia: 0, midia: 0 })).toBe(60)
  })
  it('renormaliza só os ativos', () => {
    expect(notaPersonalizada(base, { educacao: 1, minorias: 1, periferia: 0, midia: 0 })).toBe(70)
  })
  it('critério sem dados fica fora; se só há sem dados devolve null', () => {
    const c = { ...base, semDados: ['educacao'] } as Candidato
    expect(notaPersonalizada(c, { educacao: 50, minorias: 50, periferia: 0, midia: 0 })).toBe(60)
    expect(notaPersonalizada(c, { educacao: 100, minorias: 0, periferia: 0, midia: 0 })).toBeNull()
  })
  it('pesos todos zero não calculam', () => {
    expect(notaPersonalizada(base, { educacao: 0, minorias: 0, periferia: 0, midia: 0 })).toBeNull()
  })
})

describe('pesos', () => {
  it('normaliza para somar 100', () => {
    const n = normalizarPesos({ educacao: 1, minorias: 1, periferia: 1, midia: 0 })
    expect(n.educacao + n.minorias + n.periferia + n.midia).toBe(100)
  })
  it('ida e volta na URL', () => {
    expect(pesosParaQuery(PESOS_PADRAO)).toBe('40,30,20,10')
    expect(pesosDeQuery('40,30,20,10')).toEqual(PESOS_PADRAO)
    expect(pesosDeQuery('0,0,0,0')).toBeNull()
    expect(pesosDeQuery('a,b')).toBeNull()
    expect(pesosDeQuery(null)).toBeNull()
  })
})

describe('faixas de nota', () => {
  it('cores e rótulos nos limites', () => {
    expect(faixa(0).cor).toBe('vermelho')
    expect(faixa(39).cor).toBe('vermelho')
    expect(faixa(40).cor).toBe('ambar')
    expect(faixa(69).cor).toBe('ambar')
    expect(faixa(70).cor).toBe('verde')
    expect(faixa(100).hex).toBe('#067647')
  })
  it('régua de documentação', () => {
    expect(rotuloDoc(29)).toBe('Pouca fonte')
    expect(rotuloDoc(59)).toBe('Poucas fontes')
    expect(rotuloDoc(79)).toBe('Bem documentado')
    expect(rotuloDoc(80)).toBe('Muito bem documentado')
  })
})
