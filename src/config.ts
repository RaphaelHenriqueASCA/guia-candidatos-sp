// Configurações públicas do site. Nada aqui é segredo.

/** Preencha depois de criar o repositório, ex.: 'usuario/guia-candidatos-sp'. Habilita "Reportar erro" via issue do GitHub. */
export const REPO_GITHUB = 'RaphaelHenriqueASCA/guia-candidatos-sp'

/** Alternativa ao GitHub: e-mail público de contato para "Reportar erro" (deixe vazio para não expor nenhum). */
export const EMAIL_CONTATO = ''

/**
 * Link do formulário gratuito (Google Forms) para feedback e "Reportar erro", sem exigir conta no GitHub.
 * Cole o link "Enviar" do formulário (termina em /viewform). Vazio = usa o GitHub (REPO_GITHUB) como alternativa.
 */
export const FORMULARIO_URL: string = ''

/**
 * Opcional: faz o botão "Reportar erro" já preencher o candidato no formulário.
 * No Google Forms: ⋮ → "Receber link pré-preenchido", preencha o campo "Candidato" com um texto qualquer, clique em "Receber link"
 * e copie só o código do campo no link (parece "entry.123456789"). Vazio = abre o formulário em branco.
 */
export const FORMULARIO_CAMPO_CANDIDATO: string = ''

export const DATA_PESQUISA = '29/09/2026'
export const ELEICAO = '04/10/2026'
