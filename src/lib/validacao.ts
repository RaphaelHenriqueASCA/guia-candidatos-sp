import type { Candidato } from './schema'
import { CRITERIOS } from './schema'
import { notaPersonalizada, PESOS_PADRAO } from './nota'

/** Regras que vão além do schema. Devolve lista de problemas legíveis (vazia = ok). */
export function validarSemantica(lista: Candidato[]): string[] {
  const out: string[] = []
  for (const c of lista) {
    const rot = `${c.nomeUrna} (${c.id})`
    const urls = new Set<string>()
    for (const f of c.fontes) {
      if (urls.has(f.url)) out.push(`${rot}: fonte repetida ${f.url}`)
      urls.add(f.url)
      if (f.data > c.pesquisadoEm) out.push(`${rot}: fonte com data posterior à pesquisa (${f.data})`)
    }
    if (c.pontosCompativeis.length + c.pontosConflito.length > 0 && c.fontes.length === 0) {
      out.push(`${rot}: afirmações sem fonte`)
    }
    for (const k of c.semDados) if (!CRITERIOS.includes(k)) out.push(`${rot}: critério desconhecido em semDados: ${k}`)
    // a nota padrão da curadoria deve ser coerente com os critérios (tolerância 5) quando há dados suficientes
    if (c.semDados.length <= 1) {
      const n = notaPersonalizada(c, PESOS_PADRAO)
      if (n !== null && Math.abs(n - c.compat) > 5) {
        out.push(`${rot}: compat=${c.compat} difere da média dos critérios (${n}) em mais de 5 pontos`)
      }
    }
  }
  return out
}
