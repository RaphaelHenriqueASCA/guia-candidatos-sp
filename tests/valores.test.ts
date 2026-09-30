import { describe, expect, it } from 'vitest'
import { DEFS, exemploPara } from '../src/lib/areas'
import { analisarValores, dividirTrechos, sanitizar } from '../src/lib/valores'

const pos = (t: string, a: string) => analisarValores(t).areas[a as 'educacao']

describe('texto → posição por área', () => {
  it('educação pública e professores = progressista', () => {
    expect(pos('Defendo a escola pública e o respeito aos professores.', 'educacao')!.pos).toBeLessThan(0)
  })
  it('escola sem partido e escola cívico-militar = conservador', () => {
    expect(pos('Sou a favor da escola sem partido e da escola cívico-militar', 'educacao')!.pos).toBeGreaterThan(60)
  })
  it('"contra cotas" inverte o lado para conservador; "a favor de cotas" é progressista', () => {
    expect(pos('Sou contra cotas', 'minorias')!.pos).toBeGreaterThan(0)
    expect(pos('Defendo cotas raciais', 'minorias')!.pos).toBeLessThan(0)
  })
  it('"contra a privatização" é progressista; "privatizar" é conservador', () => {
    expect(pos('Sou contra a privatização', 'economia')!.pos).toBeLessThan(0)
    expect(pos('Quero privatizar e cortar impostos', 'economia')!.pos).toBeGreaterThan(0)
  })
  it('vários temas na mesma frase, cada um com seu lado', () => {
    const a = analisarValores('Quero tarifa zero no transporte público, mas também redução da maioridade penal')
    expect(a.areas.transporte!.pos).toBeLessThan(0)
    expect(a.areas.seguranca!.pos).toBeGreaterThan(0)
  })
  it('uma só área citada deixa as outras de fora (neutras por padrão no cálculo)', () => {
    const a = analisarValores('Quero mais metrô e ciclovias')
    expect(Object.keys(a.areas)).toEqual(['transporte'])
  })
  it('falar da área sem lado claro deixa neutro e sinaliza', () => {
    const e = pos('A saúde é importante para mim', 'saude')!
    expect(e.pos).toBe(0)
    expect(e.semLado).toBe(true)
  })
  it('marcador genérico "progressista"/"conservador" vale para a área citada', () => {
    expect(pos('Quero uma educação progressista', 'educacao')!.pos).toBeLessThan(0)
    expect(pos('Penso de forma conservadora sobre a família', 'familia')!.pos).toBeGreaterThan(0)
  })
  it('intensidade: "muito" reforça e "talvez" suaviza', () => {
    const forte = pos('Muito a favor de privatizar', 'economia')!.pos
    const fraco = pos('Talvez privatizar', 'economia')!.pos
    expect(forte).toBeGreaterThan(fraco)
  })
  it('nenhuma área detectada', () => {
    const a = analisarValores('quero um candidato simpático')
    expect(a.nenhum).toBe(true)
    expect(a.areas).toEqual({})
  })
  it('ignora acentos, caixa e hífens; texto vazio não quebra', () => {
    expect(pos('ESCOLA CÍVICO-MILITAR', 'educacao')!.pos).toBeGreaterThan(0)
    expect(analisarValores('').nenhum).toBe(true)
  })
  it('"transporte" não aciona minorias (palavra "trans")', () => {
    expect(analisarValores('melhorar o transporte').areas.minorias).toBeUndefined()
  })
  it('posições ficam entre -100 e 100 e em múltiplos de 5', () => {
    const p = pos('Escola sem partido, escola cívico-militar, educação domiciliar, doutrinação, homeschooling', 'educacao')!.pos
    expect(p).toBe(100)
    expect(p % 5).toBe(0)
  })
  it('temas fora das áreas são apontados', () => {
    expect(analisarValores('quero mais cultura e esporte').foraDeEscopo).toEqual(expect.arrayContaining(['cultura', 'esporte']))
  })
})

describe('trechos e sanitização', () => {
  it('divide por conectores e preserva "homem e mulher"', () => {
    expect(dividirTrechos('ana e beto, mas caio além de dora').length).toBe(4)
    expect(dividirTrechos('casamento entre homem e mulher').length).toBe(1)
  })
  it('remove controle/HTML e limita tamanho', () => {
    expect(sanitizar('a<script>b\u0000c</script>')).toBe('ascriptbc/script')
    expect(sanitizar('x'.repeat(5000)).length).toBe(1500)
    expect(sanitizar('ação\nfim')).toBe('ação\nfim')
  })
})

describe('áreas e exemplos', () => {
  it('são 9 áreas, incluindo educação, transporte e família', () => {
    expect(DEFS.map((d) => d.id)).toEqual(expect.arrayContaining(['educacao', 'transporte', 'familia']))
    expect(DEFS).toHaveLength(9)
  })
  it('cada ponta da régua tem frase de exemplo própria', () => {
    for (const d of DEFS) {
      expect(exemploPara(d.id, -100).frase).toBe(d.exemplos.progE)
      expect(exemploPara(d.id, -40).frase).toBe(d.exemplos.progM)
      expect(exemploPara(d.id, 0).rotulo).toBe('Neutro')
      expect(exemploPara(d.id, 40).frase).toBe(d.exemplos.consM)
      expect(exemploPara(d.id, 100).frase).toBe(d.exemplos.consE)
    }
  })
  it('as frases de exemplo, analisadas pelo próprio dicionário, caem no lado esperado', () => {
    for (const d of DEFS) {
      const prog = analisarValores(d.exemplos.progE).areas[d.id]
      const cons = analisarValores(d.exemplos.consE).areas[d.id]
      expect(prog && prog.pos, `${d.id} progE`).toBeLessThan(0)
      expect(cons && cons.pos, `${d.id} consE`).toBeGreaterThan(0)
    }
  })
})
