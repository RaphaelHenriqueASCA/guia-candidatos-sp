import { DEF, rotuloPosicao } from './areas'
import { nomeLegivel, type Pessoa } from './dados'
import { citadas, type Valores } from './posicao'

/** Busca de notícias no navegador da própria pessoa; só o nome do candidato vai na busca, nunca os valores dela. */
export function urlNoticias(p: Pessoa): string {
  const q = `"${nomeLegivel(p.nomeUrna)}" deputado ${p.cargo} São Paulo ${p.partido}`
  return `https://news.google.com/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`
}

/** Pedido pronto para colar no chat do Claude (ou outro assistente) do usuário. O texto fica só na área de transferência. */
export function pedidoDePesquisa(p: Pessoa, v: Valores): string {
  const areas = citadas(v)
  const meus = areas.map((a) => `- ${DEF[a].nome}: ${v[a]} (${rotuloPosicao(v[a] as number)})`).join('\n')
  return [
    `Pesquise notícias recentes e confiáveis sobre ${nomeLegivel(p.nomeUrna)} (${p.partido}, número ${p.numero}), candidato(a) a deputado ${p.cargo} por São Paulo em 2026.`,
    areas.length
      ? `Foque nas áreas que importam para mim (régua de -100 = muito progressista a +100 = muito conservador):\n${meus}`
      : 'Foque em educação, família, segurança, economia, saúde, meio ambiente, transporte, minorias e religião.',
    'Para cada área, traga falas, votos, projetos e atuação, com fonte (link) e data. Diferencie fala, denúncia, investigação, processo e condenação. Inclua a defesa do candidato quando existir e diga quando não encontrar nada.',
    'No fim, estime a posição dele em cada área de -100 a +100, dizendo em que evidência se baseia, e compare com as minhas.',
  ].join('\n\n')
}
