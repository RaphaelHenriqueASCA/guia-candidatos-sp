import { describe, expect, it } from 'vitest'
import { calcularControversia, combinar, fatorIdade, pesoBase, rotuloIndice } from '../src/lib/controversia'
import { controversiaDe, porId } from '../src/lib/dados'
import type { Ocorrencia } from '../src/lib/schema'

const oc = (tipo: Ocorrencia['tipo'], situacao: Ocorrencia['situacao'], ano = 2024): Ocorrencia => ({
  tipo,
  situacao,
  ano,
  descricao: 'Descrição de teste da ocorrência.',
  fonte: 'https://exemplo.com/a',
})

describe('pesos por tipo e situação', () => {
  it('condenação administrativa/ficha limpa pesam mais; investigação e citação, menos', () => {
    expect(pesoBase(oc('condenacao_administrativa', 'definitiva'))).toBe(90)
    expect(pesoBase(oc('condenacao_criminal', 'definitiva'))).toBe(100)
    expect(pesoBase(oc('condenacao_administrativa', 'nao_definitiva'))).toBeLessThan(90)
    expect(pesoBase(oc('acao_em_curso', 'em_curso'))).toBeGreaterThan(pesoBase(oc('investigacao', 'em_curso')))
    expect(pesoBase(oc('investigacao', 'em_curso'))).toBeGreaterThan(pesoBase(oc('citacao', 'em_curso')))
    expect(pesoBase(oc('citacao', 'em_curso'))).toBeGreaterThan(pesoBase(oc('representacao', 'em_curso')))
  })
  it('arquivada, absolvido ou revertida pesa zero em qualquer tipo', () => {
    for (const t of ['condenacao_criminal', 'condenacao_administrativa', 'investigacao', 'citacao'] as const) {
      expect(pesoBase(oc(t, 'arquivada_ou_revertida'))).toBe(0)
    }
  })
})

describe('idade e combinação', () => {
  it('fatores de idade: até 10 anos 1; até 20 anos 0,5; mais que isso 0,25', () => {
    expect(fatorIdade(2026)).toBe(1)
    expect(fatorIdade(2016)).toBe(1)
    expect(fatorIdade(2015)).toBe(0.5)
    expect(fatorIdade(2006)).toBe(0.5)
    expect(fatorIdade(2005)).toBe(0.25)
  })
  it('combina sem passar de 100 e aumenta com mais ocorrências', () => {
    expect(combinar([])).toBe(0)
    expect(combinar([100, 100, 100])).toBe(100)
    expect(combinar([25, 25])).toBeGreaterThan(25)
    expect(combinar([25, 25])).toBeLessThan(50)
    expect(combinar([90])).toBe(90)
  })
})

describe('índice de controvérsias', () => {
  it('sem pesquisa e sem Ficha Limpa não há índice; com pesquisa e sem ocorrências é zero', () => {
    expect(calcularControversia({ pesquisado: false }).indice).toBeNull()
    expect(calcularControversia({ pesquisado: true, ocorrencias: [] }).indice).toBe(0)
  })
  it('Ficha Limpa do TSE entra mesmo sem pesquisa: barrado 100, em recurso 80, citado 60', () => {
    expect(calcularControversia({ pesquisado: false, fl: 'barrado' }).indice).toBe(100)
    expect(calcularControversia({ pesquisado: false, fl: 'em_recurso' }).indice).toBe(80)
    expect(calcularControversia({ pesquisado: false, fl: 'citado' }).indice).toBe(60)
  })
  it('fato antigo pesa menos que o mesmo fato recente', () => {
    const novo = calcularControversia({ pesquisado: true, ocorrencias: [oc('investigacao', 'em_curso', 2025)] }).indice!
    const velho = calcularControversia({ pesquisado: true, ocorrencias: [oc('investigacao', 'em_curso', 1992)] }).indice!
    expect(novo).toBe(25)
    expect(velho).toBeLessThan(novo)
  })
  it('itens saem ordenados do mais pesado para o mais leve', () => {
    const c = calcularControversia({ pesquisado: true, ocorrencias: [oc('representacao', 'em_curso'), oc('condenacao_civel', 'nao_definitiva')] })
    expect(c.itens[0].peso).toBeGreaterThanOrEqual(c.itens[1].peso)
  })
  it('rótulos por faixa', () => {
    expect(rotuloIndice(null)).toBe('Não pesquisado')
    expect(rotuloIndice(0)).toBe('Nenhuma ocorrência encontrada')
    expect(rotuloIndice(10)).toBe('Baixo')
    expect(rotuloIndice(30)).toBe('Moderado')
    expect(rotuloIndice(60)).toBe('Alto')
    expect(rotuloIndice(90)).toBe('Muito alto')
  })
})

describe('índice nos candidatos do site', () => {
  it('Mauro Bragato (condenação por improbidade transitada em julgado) tem índice alto', () => {
    const c = controversiaDe(porId('estadual-55125')!)
    expect(c.indice).toBe(90)
  })
  it('Russomanno: condenação revertida pesa zero e o índice vem só de citações leves', () => {
    const c = controversiaDe(porId('federal-1000')!)
    expect(c.itens.find((i) => i.rotulo.startsWith('Condenação criminal'))?.peso).toBe(0)
    expect(c.indice!).toBeLessThan(20)
  })
  it('candidato sem pesquisa e sem Ficha Limpa fica como não pesquisado; barrado pela Ficha Limpa tem 100', () => {
    expect(porId('federal-1120')?.fl).toBe('citado')
    expect(controversiaDe(porId('federal-1120')!).indice).toBe(60)
    const barrado = controversiaDe({ id: 'x', cargo: 'federal', numero: '0000', nomeUrna: 'X', partido: 'PP', fl: 'barrado' })
    expect(barrado.indice).toBe(100)
    expect(controversiaDe({ id: 'y', cargo: 'federal', numero: '0001', nomeUrna: 'Y', partido: 'PP' }).indice).toBeNull()
  })
})
