// Configurações públicas do site. Nada aqui é segredo.

/** Repositório no GitHub (só informativo; o feedback não depende dele). */
export const REPO_GITHUB = 'RaphaelHenriqueASCA/guia-candidatos-sp'

/**
 * E-mail que recebe os feedbacks enviados pelo formulário do site (via FormSubmit.co, gratuito, sem conta para quem envia).
 * Ele fica visível no código do site. Na primeira mensagem, o FormSubmit manda um e-mail de ativação para este endereço: clique em
 * "Activate Form" uma vez e as próximas chegam direto.
 */
export const EMAIL_CONTATO = 'raphafisicousp@gmail.com'

/**
 * Quando você criar o formulário (Google Forms, Tally etc.), cole aqui o link. Se preenchido, "Enviar feedback" e "Reportar erro"
 * abrem esse formulário em vez do formulário interno. Vazio = usa o formulário interno do site.
 */
export const FORMULARIO_URL: string = ''

/**
 * Opcional (só vale com FORMULARIO_URL): código do campo "Candidato" para pré-preencher no "Reportar erro".
 * No Google Forms: ⋮ → "Receber link pré-preenchido" → preencha o campo com um texto → "Receber link" → copie o "entry.123456789".
 */
export const FORMULARIO_CAMPO_CANDIDATO: string = ''

export const DATA_PESQUISA = '29/09/2026'
export const ELEICAO = '04/10/2026'
