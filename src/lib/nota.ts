export type Faixa = { cor: 'vermelho' | 'ambar' | 'verde'; hex: string; rotulo: string }

const FAIXAS: Faixa[] = [
  { cor: 'vermelho', hex: '#B42318', rotulo: 'Baixa' },
  { cor: 'ambar', hex: '#B54708', rotulo: 'Média' },
  { cor: 'verde', hex: '#067647', rotulo: 'Alta' },
]

/** 0–39 vermelho, 40–69 âmbar, 70–100 verde. */
export function faixa(nota: number): Faixa {
  if (nota < 40) return FAIXAS[0]
  if (nota < 70) return FAIXAS[1]
  return FAIXAS[2]
}

export function rotuloAfinidade(nota: number): string {
  return nota < 40 ? 'Pouca afinidade' : nota < 70 ? 'Afinidade média' : 'Muita afinidade'
}

export function rotuloDoc(nota: number): string {
  if (nota < 30) return 'Pouca fonte'
  if (nota < 60) return 'Poucas fontes'
  if (nota < 80) return 'Bem documentado'
  return 'Muito bem documentado'
}
