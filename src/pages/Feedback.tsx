import { useState, type FormEvent } from 'react'
import { nomeLegivel, porId } from '../lib/dados'
import { enviarFeedback, TIPOS_FEEDBACK, type TipoFeedback } from '../lib/feedback'

/** Formulário interno: sem conta, sem cookies; a mensagem segue por e-mail para o autor (via FormSubmit.co). */
export function Feedback({ id }: { id?: string }) {
  const p = id ? porId(id) : undefined
  const [tipo, setTipo] = useState<TipoFeedback>(p ? 'Erro em uma ficha' : 'Sugestão')
  const [candidato, setCandidato] = useState(p ? `${nomeLegivel(p.nomeUrna)} (${p.partido} ${p.numero})` : '')
  const [mensagem, setMensagem] = useState('')
  const [contato, setContato] = useState('')
  const [isca, setIsca] = useState('')
  const [estado, setEstado] = useState<'ocioso' | 'enviando' | 'enviado'>('ocioso')
  const [erro, setErro] = useState('')

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setEstado('enviando')
    const pagina = id ? `${window.location.origin}${window.location.pathname}#/candidato/${id}` : `${window.location.origin}${window.location.pathname}`
    const r = await enviarFeedback({ tipo, mensagem, candidato, contato, isca }, pagina)
    if (r.ok) setEstado('enviado')
    else {
      setErro(r.motivo)
      setEstado('ocioso')
    }
  }

  if (estado === 'enviado') {
    return (
      <div className="max-w-xl">
        <h1 className="text-3xl font-extrabold text-petroleo">Obrigado!</h1>
        <p role="status" className="mt-2">Sua mensagem foi enviada. Se você deixou um contato, o autor pode responder.</p>
        <p className="mt-4"><a className="btn" href="#/">Voltar aos candidatos</a></p>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-extrabold text-petroleo">Enviar feedback</h1>
      <p className="mt-1 text-suave">Achou um erro, algo estranho ou tem uma ideia? Conta aqui. Não precisa de conta em lugar nenhum.</p>

      <form onSubmit={enviar} className="mt-5 space-y-4">
        <div>
          <label htmlFor="fb-tipo" className="text-sm font-bold">Sobre o quê?</label>
          <select id="fb-tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoFeedback)} className="mt-1 block min-h-11 w-full rounded-xl border border-borda bg-white px-3 text-base">
            {TIPOS_FEEDBACK.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="fb-cand" className="text-sm font-bold">Candidato <span className="font-normal text-suave">(se for o caso)</span></label>
          <input id="fb-cand" value={candidato} onChange={(e) => setCandidato(e.target.value)} maxLength={120} className="mt-1 min-h-11 w-full rounded-xl border border-borda bg-white px-3 text-base" />
        </div>
        <div>
          <label htmlFor="fb-msg" className="text-sm font-bold">Mensagem</label>
          <textarea
            id="fb-msg"
            required
            rows={6}
            maxLength={3000}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder={tipo === 'Erro em uma ficha' ? 'O que está errado? Se puder, cole o link de uma fonte que confirma a correção.' : 'Conte o que aconteceu ou o que você sugere.'}
            className="mt-1 w-full rounded-xl border border-borda bg-white p-3 text-base"
          />
        </div>
        <div>
          <label htmlFor="fb-contato" className="text-sm font-bold">Seu contato <span className="font-normal text-suave">(opcional, se quiser resposta)</span></label>
          <input id="fb-contato" value={contato} onChange={(e) => setContato(e.target.value)} maxLength={160} className="mt-1 min-h-11 w-full rounded-xl border border-borda bg-white px-3 text-base" />
        </div>
        {/* campo-isca contra robôs: escondido de pessoas e do leitor de tela */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Não preencha<input tabIndex={-1} autoComplete="off" value={isca} onChange={(e) => setIsca(e.target.value)} /></label>
        </div>

        {erro && <p role="alert" className="rounded-lg border border-vermelho bg-white p-2 text-sm text-vermelho">{erro}</p>}
        <button type="submit" className="btn" disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Enviar feedback'}</button>
        <p className="text-xs text-suave">
          Ao enviar, a mensagem (e o contato, se você o informar) vai ao autor por e-mail, por meio do serviço gratuito FormSubmit. Seus valores
          políticos <strong>não</strong> são enviados.
        </p>
      </form>
    </div>
  )
}
