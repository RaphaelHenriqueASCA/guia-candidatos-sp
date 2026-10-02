import { describe, expect, it, vi } from 'vitest'
import { EMAIL_CONTATO } from '../src/config'
import { ENDPOINT_FEEDBACK, enviarFeedback, montarCorpo, type DadosFeedback } from '../src/lib/feedback'
import { destinoFeedback } from '../src/lib/pesquisa'

const dados: DadosFeedback = { tipo: 'Erro em uma ficha', mensagem: 'O número está errado nesta ficha.', candidato: 'Keit Lima (PSOL 50300)', contato: '', isca: '' }

describe('destino do feedback (formulário interno enquanto não há formulário externo)', () => {
  it('geral e por candidato apontam para o formulário interno', () => {
    expect(destinoFeedback()).toEqual({ href: '#/feedback', externo: false })
    expect(destinoFeedback({ id: 'estadual-50300', rotulo: 'x' })).toEqual({ href: '#/feedback/estadual-50300', externo: false })
  })
})

describe('envio do feedback', () => {
  it('o endpoint usa o e-mail configurado', () => {
    expect(ENDPOINT_FEEDBACK).toBe(`https://formsubmit.co/ajax/${EMAIL_CONTATO}`)
    expect(EMAIL_CONTATO).toBe('raphafisicousp@gmail.com')
  })
  it('o corpo leva tipo, candidato, mensagem e página, e nenhum valor político', () => {
    const c = montarCorpo(dados, 'https://site/#/candidato/estadual-50300')
    expect(c.Tipo).toBe('Erro em uma ficha')
    expect(c.Mensagem).toContain('número está errado')
    expect(c._subject).toContain('Keit Lima')
    expect(JSON.stringify(c)).not.toMatch(/educacao|valores/i)
  })
  it('rejeita mensagem vazia sem chamar a rede', async () => {
    const f = vi.fn()
    const r = await enviarFeedback({ ...dados, mensagem: ' ' }, 'p', f as unknown as typeof fetch)
    expect(r.ok).toBe(false)
    expect(f).not.toHaveBeenCalled()
  })
  it('envia por POST JSON e devolve ok', async () => {
    const f = vi.fn().mockResolvedValue({ ok: true })
    const r = await enviarFeedback(dados, 'p', f as unknown as typeof fetch)
    expect(r).toEqual({ ok: true })
    expect(f).toHaveBeenCalledWith(ENDPOINT_FEEDBACK, expect.objectContaining({ method: 'POST' }))
  })
  it('trata erro do serviço e falha de rede com mensagem clara', async () => {
    const r1 = await enviarFeedback(dados, 'p', vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch)
    const r2 = await enviarFeedback(dados, 'p', vi.fn().mockRejectedValue(new Error('x')) as unknown as typeof fetch)
    expect(r1.ok).toBe(false)
    expect(r2).toMatchObject({ ok: false, motivo: expect.stringContaining('conexão') })
  })
  it('campo-isca preenchido (robô) não envia nada', async () => {
    const f = vi.fn()
    const r = await enviarFeedback({ ...dados, isca: 'spam' }, 'p', f as unknown as typeof fetch)
    expect(r.ok).toBe(true)
    expect(f).not.toHaveBeenCalled()
  })
})
