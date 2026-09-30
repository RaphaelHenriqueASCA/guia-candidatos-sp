import type { Candidato } from './schema'
import { partidos } from './posicao'

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
    if (!(c.partido.toUpperCase() in partidos.partidos)) {
      out.push(`${rot}: partido "${c.partido}" não está em data/partidos.json (adicione com lr: null se não houver classificação)`)
    }
  }
  return out
}
