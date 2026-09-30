import { describe, expect, it } from 'vitest'
import { analisarValores, dividirTrechos, sanitizar } from '../src/lib/valores'

const soma = (p: Record<string, number>) => Object.values(p).reduce((a, b) => a + b, 0)

describe('extração de pesos do texto', () => {
  it('um único critério recebe 100', () => {
    const a = analisarValores('Quero alguém que defenda a escola pública.')
    expect(a.pesos).toEqual({ educacao: 100, minorias: 0, periferia: 0, midia: 0 })
    expect(a.nenhum).toBe(false)
  })

  it('vários critérios em frases separadas por pontuação, somando 100', () => {
    const a = analisarValores('Defenda os professores. Que apoie as mulheres; seja da periferia! Discreto, sem holofote?')
    expect(soma(a.pesos)).toBe(100)
    expect(a.pesos.educacao).toBeGreaterThan(0)
    expect(a.pesos.minorias).toBeGreaterThan(0)
    expect(a.pesos.periferia).toBeGreaterThan(0)
    expect(a.pesos.midia).toBeGreaterThan(0)
  })

  it('um trecho pode acionar mais de um critério', () => {
    const a = analisarValores('quero alguém da periferia que defenda a escola pública')
    expect(a.pesos.periferia).toBeGreaterThan(0)
    expect(a.pesos.educacao).toBeGreaterThan(0)
    expect(a.pesos.minorias).toBe(0)
  })

  it('divide por conectores e mostra o trecho que acionou', () => {
    const a = analisarValores('valorizo a educação e os direitos dos negros, mas também gosto de candidato discreto')
    expect(a.evidencias.educacao[0]).toContain('educação')
    expect(a.evidencias.minorias[0]).toContain('negros')
    expect(a.evidencias.midia[0]).toContain('discreto')
    expect(dividirTrechos('ana e beto, mas caio além de dora').length).toBe(4)
  })

  it('"principalmente" e "prioridade" aumentam o peso; "não me importo" reduz', () => {
    const forte = analisarValores('educação e principalmente periferia')
    expect(forte.pesos.periferia).toBeGreaterThan(forte.pesos.educacao)
    const fraco = analisarValores('educação e não me importo com periferia')
    expect(fraco.pesos.educacao).toBeGreaterThan(fraco.pesos.periferia)
    expect(fraco.pesos.periferia).toBeGreaterThan(0)
  })

  it('ignora acentos e caixa', () => {
    expect(analisarValores('EDUCAÇÃO').pesos.educacao).toBe(100)
    expect(analisarValores('Deficiência').pesos.minorias).toBe(100)
  })

  it('nenhum critério detectado devolve pesos zerados e nenhum=true', () => {
    const a = analisarValores('quero um candidato honesto')
    expect(a.nenhum).toBe(true)
    expect(soma(a.pesos)).toBe(0)
    expect(a.foraDeEscopo).toContain('corrupção')
  })

  it('"trans" não casa com "transporte"', () => {
    const a = analisarValores('melhorar o transporte')
    expect(a.pesos.minorias).toBe(0)
    expect(a.foraDeEscopo).toContain('transporte')
  })

  it('texto vazio não quebra', () => {
    expect(analisarValores('').nenhum).toBe(true)
  })
})

describe('sanitização de texto', () => {
  it('remove caracteres de controle e sinais de HTML', () => {
    expect(sanitizar('a<script>b\u0000c</script>')).toBe('ascriptbc/script')
  })
  it('limita o tamanho', () => {
    expect(sanitizar('x'.repeat(5000)).length).toBe(1500)
  })
  it('mantém quebras de linha e acentos', () => {
    expect(sanitizar('ação\nfim')).toBe('ação\nfim')
  })
})
