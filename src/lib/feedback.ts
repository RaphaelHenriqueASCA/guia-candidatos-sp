import { EMAIL_CONTATO } from '../config'

export const TIPOS_FEEDBACK = ['Erro em uma ficha', 'Algo não funcionou', 'Sugestão', 'Elogio', 'Outro'] as const
export type TipoFeedback = (typeof TIPOS_FEEDBACK)[number]

export type DadosFeedback = {
  tipo: TipoFeedback
  mensagem: string
  candidato: string
  contato: string
  /** Campo-isca: pessoas reais não o preenchem; robôs sim. */
  isca: string
}

/** Endpoint gratuito do FormSubmit: entrega a mensagem por e-mail, sem conta para quem envia. */
export const ENDPOINT_FEEDBACK = `https://formsubmit.co/ajax/${EMAIL_CONTATO}`

const limitar = (s: string, n: number) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, n)

/** Monta o corpo enviado. Nunca inclui os valores políticos da pessoa nem dados do navegador além da página. */
export function montarCorpo(d: DadosFeedback, pagina: string): Record<string, string> {
  return {
    _subject: `Guia SP 2026: ${d.tipo}${d.candidato ? ` (${limitar(d.candidato, 60)})` : ''}`,
    _template: 'table',
    _captcha: 'false',
    _honey: d.isca,
    Tipo: d.tipo,
    Candidato: limitar(d.candidato, 120),
    Mensagem: limitar(d.mensagem, 3000),
    Contato: limitar(d.contato, 160),
    Pagina: pagina,
  }
}

export type Resultado = { ok: true } | { ok: false; motivo: string }

export async function enviarFeedback(d: DadosFeedback, pagina: string, envio: typeof fetch = fetch): Promise<Resultado> {
  if (limitar(d.mensagem, 3000).length < 5) return { ok: false, motivo: 'Escreva ao menos uma frase na mensagem.' }
  if (d.isca) return { ok: true } // robô: finge que enviou
  try {
    const r = await envio(ENDPOINT_FEEDBACK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(montarCorpo(d, pagina)),
    })
    if (!r.ok) return { ok: false, motivo: 'O envio falhou. Tente de novo em instantes.' }
    return { ok: true }
  } catch {
    return { ok: false, motivo: 'Sem conexão com o serviço de envio. Tente de novo em instantes.' }
  }
}
