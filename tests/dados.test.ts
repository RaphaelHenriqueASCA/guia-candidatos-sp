import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { candidatosSchema, tseSchema } from '../src/lib/schema'
import { partidos } from '../src/lib/posicao'
import { validarSemantica } from '../src/lib/validacao'

const ler = (p: string) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'))
const bruto = ler('../data/candidatos.json')
const tse = tseSchema.parse(ler('../data/tse-sp.json'))

describe('seed', () => {
  it('passa no schema e tem 36 candidatos (18 federais, 18 estaduais)', () => {
    const r = candidatosSchema.parse(bruto)
    expect(r).toHaveLength(36)
    expect(r.filter((c) => c.cargo === 'federal')).toHaveLength(18)
  })
  it('passa nas regras de conteúdo', () => {
    expect(validarSemantica(candidatosSchema.parse(bruto))).toEqual([])
  })
  it('todos os pesquisados existem na lista do TSE com o mesmo nome e partido', () => {
    const porId = new Map(tse.map((t) => [t.id, t]))
    for (const c of candidatosSchema.parse(bruto)) {
      const t = porId.get(c.id)
      expect(t, c.id).toBeDefined()
      expect(t!.partido.normalize('NFD').toUpperCase()).toBe(c.partido.normalize('NFD').toUpperCase())
    }
  })
})

describe('TSE e partidos', () => {
  it('lista do TSE tem candidatos federais e estaduais, sem ids repetidos', () => {
    expect(tse.length).toBeGreaterThan(1000)
    expect(new Set(tse.map((t) => t.id)).size).toBe(tse.length)
    expect(tse.some((t) => t.cargo === 'federal')).toBe(true)
    expect(tse.some((t) => t.cargo === 'estadual')).toBe(true)
  })
  it('todo partido do TSE está em partidos.json', () => {
    for (const p of new Set(tse.map((t) => t.partido))) expect(partidos.partidos, p).toHaveProperty([p])
  })
})

describe('schema', () => {
  const ok = candidatosSchema.parse(bruto)[0]
  it('rejeita nota de documentação fora de 0–100 e posição fora de -100…100', () => {
    expect(candidatosSchema.safeParse([{ ...ok, doc: 101 }]).success).toBe(false)
    expect(candidatosSchema.safeParse([{ ...ok, posicoes: { educacao: { valor: 150, nota: 'fora da faixa' } } }]).success).toBe(false)
  })
  it('rejeita URL malformada e fonte sem data', () => {
    expect(candidatosSchema.safeParse([{ ...ok, fontes: [{ titulo: 'x y z', url: 'nao-e-url', data: '2026-09-29' }] }]).success).toBe(false)
    expect(candidatosSchema.safeParse([{ ...ok, fontes: [{ titulo: 'x y z', url: 'https://a.com' }] }]).success).toBe(false)
  })
  it('rejeita afirmações sem fonte', () => {
    expect(candidatosSchema.safeParse([{ ...ok, fontes: [] }]).success).toBe(false)
  })
  it('rejeita id inconsistente e ids duplicados', () => {
    expect(candidatosSchema.safeParse([{ ...ok, id: 'federal-9999' }]).success).toBe(false)
    expect(candidatosSchema.safeParse([ok, ok]).success).toBe(false)
  })
  it('validação semântica acusa fonte com data posterior à pesquisa e partido desconhecido', () => {
    const c = { ...ok, fontes: [{ ...ok.fontes[0], data: '2026-10-01' }] }
    expect(validarSemantica([c]).join()).toContain('posterior')
    expect(validarSemantica([{ ...ok, partido: 'XYZ' }]).join()).toContain('partidos.json')
  })
})
