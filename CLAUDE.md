# Guia de Candidatos SP 2026

Site 100% estático (Vite + React + TypeScript + Tailwind v4) que compara candidatos a deputado federal/estadual por SP (eleição 04/10/2026). Escrito em português do Brasil. **Custo zero**: sem API paga, servidor, banco, domínio pago, analytics, cookies de rastreamento nem IA em tempo de execução. Hospedagem: GitHub Pages (deploy por Actions).

## Comandos
- `npm run dev` / `npm run build` (tsc + vite) / `npm run lint` (tsc --noEmit) / `npm test` (Vitest)
- `npm run validate`: schema Zod + fontes com URL e data + partidos conferidos com data/partidos.json e data/tse-sp.json
- `npm run sync:tse`: confere nome de urna/número/partido com os dados abertos do TSE, gera data/tse-sp.json e baixa todas as fotos para `public/fotos/{cargo}-{numero}.jpg`. Divergência => sai com erro (exit 1). Flag `--offline` reaproveita o cache em `.cache/`.
- `npm run check:links`: testa as URLs das fontes (403/429 = "bloqueou robô", só aviso)

## Decisões
- **Vite** (não Astro): SPA com rotas por hash (`#/candidato/federal-1300`), `base: './'` funciona em qualquer subcaminho do Pages.
- **TSE**: a API DivulgaCandContas retorna "Access Denied" (Akamai) para acesso automatizado; usamos os dados abertos (`consulta_cand_2026.zip` e `foto_cand2026_SP_div.zip`, foto = `F{UF}{SQ_CANDIDATO}_div.jpg`).
- **Dados**: `data/candidatos.json` é a fonte única. `id` = `{cargo}-{numero}`. Cada fonte tem `data` (AAAA-MM-DD); cada candidato tem `origem` e `pesquisadoEm`.
- **Modelo**: 9 áreas (educacao, familia, seguranca, economia, saude, ambiente, transporte, minorias, religiao), cada uma com régua -100 (progressista) a +100 (conservador). Posição do candidato: curadoria (campo `posicoes`, só onde há evidência) > partido (`data/partidos.json`, escala esquerda-direita de Bolognesi et al. 2025, igual em todas as áreas) > sem classificação. `doc` = régua de documentação.
- **Todos os candidatos**: `data/tse-sp.json` (gerado por sync:tse, sem dados pessoais) + fotos de todos em `public/fotos/`. Números repetidos no TSE são omitidos.
- **Afinidade** (`src/lib/posicao.ts`): 100 - distância média ponderada; áreas citadas pesam 1, não citadas contam como neutras com peso 0,25. Sem área citada = sem afinidade.
- **Meus valores**: `src/lib/areas.ts` (dicionário + frases de exemplo) e `src/lib/valores.ts` (texto -> posição, sem IA; "contra/fim de" inverte termos marcados com ~). Ao vivo, sem botão aplicar. Valores só na URL (`?v=educacao:-80,familia:60`). Voz: Web Speech API (`src/lib/ditado.ts`).
- **Configuração pública** em `src/config.ts`: `REPO_GITHUB` (habilita "Reportar erro" via issue) e `EMAIL_CONTATO`. Sem nenhum dos dois, o botão não aparece.
- Fonte: Manrope self-hosted (`@fontsource-variable/manrope`), sem chamada ao Google Fonts.

## Regras de neutralidade e conteúdo
- Toda afirmação precisa de fonte e data. Distinguir fala, denúncia, investigação, processo e condenação.
- Incluir a defesa do candidato quando existir; dizer quando não foi encontrada.
- Sem dados pessoais sensíveis fora de plataformas públicas.
- Aviso fixo: "Curadoria pessoal, pesquisada em 29/09/2026. Confira as fontes." e deixar claro que afinidade e posições são **estimativas** com os dados encontrados.
- Origem marcada como "curadoria inicial". Acessibilidade WCAG AA (foco visível, contraste, alt text, `aria-label`).
- Nunca colocar segredos no repositório.

## Design
Fundo `#F7F5F0`, cartões brancos com borda `#E7E2D9`, texto `#1F2937`, petróleo `#0B3B4A`, acento `#E4572E`. Faixas: 0–39 `#B42318`, 40–69 `#B54708`, 70–100 `#067647` (sempre com número e rótulo).
