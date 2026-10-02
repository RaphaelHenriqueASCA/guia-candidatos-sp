import { DEF, rotuloPosicao } from './areas'
import { nomeLegivel, type Pessoa } from './dados'
import { citadas, type Valores } from './posicao'

/** Busca de notícias no navegador da própria pessoa; só o nome do candidato vai na busca, nunca os valores dela. */
export function urlNoticias(p: Pessoa): string {
  const q = `"${nomeLegivel(p.nomeUrna)}" deputado ${p.cargo} São Paulo ${p.partido}`
  return `https://news.google.com/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`
}

/** Pedido para qualquer assistente de IA com acesso à internet. Não menciona nenhuma IA específica. */
export function pedidoDePesquisa(p: Pessoa, v: Valores): string {
  const areas = citadas(v)
  const meus = areas.map((a) => `- ${DEF[a].nome}: ${v[a]} (${rotuloPosicao(v[a] as number).toLowerCase()})`).join('\n')
  return [
    `Pesquise na internet notícias recentes e confiáveis sobre ${nomeLegivel(p.nomeUrna)} (${p.partido}, número ${p.numero}), candidato(a) a deputado ${p.cargo} por São Paulo nas eleições de 04/10/2026.`,
    areas.length
      ? `Foque nas áreas que importam para mim, numa régua de -100 (muito progressista) a +100 (muito conservador):\n${meus}`
      : 'Foque em educação, família e costumes, segurança, economia, saúde, meio ambiente, transporte, minorias e religião.',
    'Para cada área, traga falas, votos, projetos de lei e atuação, sempre com link da fonte e data. Priorize veículos de imprensa reconhecidos e documentos oficiais (Alesp, Câmara, TSE). Diferencie claramente fala, denúncia, investigação, processo e condenação. Inclua a defesa do candidato quando existir e diga quando não encontrar nada. Não invente: marque o que não conseguiu confirmar.',
    'No fim, estime a posição dele em cada área de -100 a +100, explicando em que evidência se baseia, e diga em quais áreas ele está perto ou distante das minhas posições.',
  ].join('\n\n')
}

export type IA = {
  id: string
  nome: string
  /** 'link' = abre já com a pesquisa feita; 'copiar' = copia o pedido e abre o site (cole com Ctrl+V). */
  modo: 'link' | 'copiar'
  /** Nota curta sobre o plano gratuito. */
  nota: string
  url: (pedido: string) => string
}

/** IAs com uso gratuito (com limites; algumas podem pedir login). Testadas em out/2026; os sites podem mudar. */
export const IAS: IA[] = [
  {
    id: 'perplexity',
    nome: 'Perplexity',
    modo: 'link',
    nota: 'Pesquisa na web e mostra as fontes. Grátis, sem login.',
    url: (p) => `https://www.perplexity.ai/search?q=${encodeURIComponent(p)}`,
  },
  {
    id: 'chatgpt',
    nome: 'ChatGPT',
    modo: 'link',
    nota: 'Grátis com limites; busca na web.',
    url: (p) => `https://chatgpt.com/?q=${encodeURIComponent(p)}&hints=search`,
  },
  {
    id: 'gemini',
    nome: 'Gemini',
    modo: 'copiar',
    nota: 'Grátis com conta Google. Cole o pedido (Ctrl+V).',
    url: () => 'https://gemini.google.com/app',
  },
  {
    id: 'deepseek',
    nome: 'DeepSeek',
    modo: 'copiar',
    nota: 'Grátis com conta. Ative “Busca” e cole o pedido (Ctrl+V).',
    url: () => 'https://chat.deepseek.com/',
  },
]
