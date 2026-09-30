# Como adicionar candidatos (sem custo)

Você usa o chat do Claude que já tem (sem API). Ele pesquisa e devolve um JSON; você cola no projeto.

## 1. Peça ao Claude (prompt-modelo)

Cole isto no chat, trocando os campos entre colchetes:

```text
Pesquise, com fontes reais e datas, o candidato abaixo (eleição de 04/10/2026, São Paulo) e devolva APENAS um objeto JSON no formato do meu site.

Candidato: [nome de urna] · cargo: [federal ou estadual] · número: [1234 ou 12345]

Regras:
- Toda afirmação precisa de fonte com URL real (que você abriu) e data de acesso (AAAA-MM-DD). Não invente URLs.
- Distinga fala, denúncia, investigação, processo e condenação. Inclua a defesa do candidato se existir; se não encontrar, diga isso no ponto.
- Sem dados pessoais sensíveis fora do que for plataforma pública. Tom neutro, sem adjetivos.
- "pontosCompativeis" e "pontosConflito": frases curtas, cada uma com base nas fontes.
- Critérios do autor (ordem): 1) educação progressista e respeito aos professores; 2) empatia com causas das minorias; 3) origem na periferia e projetos populares; 4) baixa exposição midiática.
- "criterios": nota 0–100 por critério, derivada só dos pontos listados. Onde não houver evidência, use 50 e liste o critério em "semDados".
- "compat": estimativa 0–100 coerente com a média ponderada 40/30/20/10 dos critérios com dados (diferença máxima de 5).
- "doc" (régua de documentação): 0–29 pouca fonte, única ou partidária; 30–59 poucas fontes ou enviesadas; 60–79 ao menos 2 fontes jornalísticas independentes ou documento oficial; 80–100 várias fontes independentes e/ou documento primário.
- "origem": "curadoria inicial" e "pesquisadoEm": a data de hoje.

Formato exato:
{
  "id": "{cargo}-{numero}",
  "cargo": "federal" | "estadual",
  "nomeUrna": "...",
  "partido": "SIGLA como no TSE",
  "numero": "1234",
  "compat": 0,
  "doc": 0,
  "criterios": {"educacao": 0, "minorias": 0, "periferia": 0, "midia": 0},
  "semDados": [],
  "pontosCompativeis": ["..."],
  "pontosConflito": ["..."],
  "fontes": [{"titulo": "...", "url": "https://...", "data": "AAAA-MM-DD"}],
  "origem": "curadoria inicial",
  "pesquisadoEm": "AAAA-MM-DD"
}
```

## 2. Cole no projeto

1. Abra `data/candidatos.json` e adicione o objeto ao final da lista (lembre da vírgula).
2. Rode:

```bash
npm run validate && npm run sync:tse && npm run check:links
```

- `validate`: confere o formato, fontes com URL/data e a coerência das notas.
- `sync:tse`: confere nome de urna, número e partido com o TSE e baixa a foto oficial. Se apontar divergência, corrija o JSON.
- `check:links`: lista fontes quebradas (403/429 costumam ser bloqueio de robô: abra no navegador).

3. Faça commit e push na `main` (o deploy é automático).

## 3. Deploy no GitHub Pages (uma vez)

1. Crie um repositório no GitHub (pode ser público, gratuito) e envie o projeto:

```bash
git add -A
git commit -m "Guia de candidatos SP 2026"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git
git push -u origin main
```

2. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. O workflow `.github/workflows/deploy.yml` roda a cada push na `main` (validate + testes + build + deploy). O site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.
4. (Opcional) Em `src/config.ts`, preencha `REPO_GITHUB: 'SEU-USUARIO/NOME-DO-REPO'` para ativar o botão "Reportar erro" (abre uma issue pré-preenchida). Ative as *Issues* nas configurações do repositório.

Alternativa gratuita: Cloudflare Pages (build `npm run build`, pasta `dist`).
