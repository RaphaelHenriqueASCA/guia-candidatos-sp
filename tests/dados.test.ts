import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { candidatosSchema } from '../src/lib/schema'
import { validarSemantica } from '../src/lib/validacao'

const bruto = JSON.parse(readFileSync(new URL('../data/candidatos.json', import.meta.url), 'utf8'))

describe('seed', () => {
  it('passa no schema e tem 12 candidatos (6 federais, 6 estaduais)', () => {
    const r = candidatosSchema.parse(bruto)
    expect(r).toHaveLength(12)
    expect(r.filter((c) => c.cargo === 'federal')).toHaveLength(6)
  })
  it('passa nas regras de conteúdo (fontes com data, compat coerente com critérios)', () => {
    expect(validarSemantica(candidatosSchema.parse(bruto))).toEqual([])
  })
})

describe('schema', () => {
  const ok = candidatosSchema.parse(bruto)[0]
  it('rejeita nota fora de 0–100', () => {
    expect(candidatosSchema.safeParse([{ ...ok, compat: 101 }]).success).toBe(false)
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
  it('validação semântica acusa fonte com data posterior à pesquisa', () => {
    const c = { ...ok, fontes: [{ ...ok.fontes[0], data: '2026-10-01' }] }
    expect(validarSemantica([c]).join()).toContain('posterior')
  })
})
