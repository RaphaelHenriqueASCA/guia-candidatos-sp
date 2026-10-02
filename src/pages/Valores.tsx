import { useMemo, useState } from 'react'
import { DEFS, exemploPara, rotuloPosicao } from '../lib/areas'
import { Cartao } from '../components/Cartao'
import { ditadoSuportado, useDitado } from '../lib/ditado'
import { pessoas } from '../lib/dados'
import { useEstado } from '../lib/estado'
import { afinidade, citadas } from '../lib/posicao'
import { analisarValores, sanitizar, type Analise } from '../lib/valores'
import { CopiarLink } from './Ficha'

export function Valores() {
  const { valores, temValores, texto, setTexto, definirArea, definirTodos, limpar } = useEstado()
  const [parcial, setParcial] = useState('')
  const [analise, setAnalise] = useState<Analise | null>(null)
  const [cargo, setCargo] = useState<'federal' | 'estadual'>('federal')

  const suportado = ditadoSuportado()
  const { gravando, erro, iniciar, parar } = useDitado(
    (t) => setTexto((atual) => sanitizar((atual ? atual.replace(/\s*$/, ' ') : '') + t)),
    setParcial,
  )

  function entender() {
    parar()
    const a = analisarValores(texto)
    setAnalise(a)
    if (a.nenhum) return
    // áreas citadas passam a valer; o que já estava ajustado à mão e não foi citado de novo é mantido
    const novo = { ...valores }
    for (const d of DEFS) {
      const e = a.areas[d.id]
      if (e) novo[d.id] = e.pos
    }
    definirTodos(novo)
  }

  const ranking = useMemo(() => {
    if (!temValores) return []
    return pessoas
      .filter((p) => p.cargo === cargo)
      .map((p) => ({ p, a: afinidade(p, valores) }))
      .filter((x): x is { p: (typeof pessoas)[number]; a: number } => x.a !== null)
      .sort((x, y) => y.a - x.a || Number(!!y.p.curado) - Number(!!x.p.curado))
      .slice(0, 6)
      .map((x) => x.p)
  }, [valores, temValores, cargo])

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-petroleo">Meus valores</h1>
      <p className="mt-1 max-w-3xl text-suave">
        Fale ou escreva o que pensa, ou mova as réguas. Cada área vai de <strong>progressista</strong> a <strong>conservador</strong>. O que você
        não citar conta como neutro e pesa pouco. Tudo se atualiza na hora.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_minmax(0,22rem)]">
        <div>
          <label htmlFor="valores" className="text-base font-bold">
            Conte o que é importante para você ao votar
          </label>
          <textarea
            id="valores"
            rows={5}
            value={texto}
            onChange={(e) => setTexto(sanitizar(e.target.value))}
            placeholder="Ex.: Defendo a escola pública e os professores, mas quero penas mais duras para crimes violentos."
            className="mt-2 w-full rounded-xl border border-borda bg-white p-3 text-base"
          />
          {parcial && (
            <p className="mt-1 text-sm italic text-suave" aria-live="polite">
              Ouvindo: {parcial}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {suportado ? (
              <button
                type="button"
                onClick={gravando ? parar : iniciar}
                aria-pressed={gravando}
                aria-label={gravando ? 'Parar de gravar' : 'Ditar por voz'}
                className={gravando ? 'btn bg-vermelho hover:bg-vermelho' : 'btn-sec'}
              >
                <span aria-hidden="true">{gravando ? '■' : '🎤'}</span>
                {gravando ? 'Gravando… toque para parar' : 'Ditar por voz'}
              </button>
            ) : (
              <p className="text-sm text-suave" role="note">Ditado não disponível neste navegador; digite seus valores.</p>
            )}
            <button type="button" className="btn" onClick={entender} disabled={texto.trim().length === 0}>
              Posicionar as réguas pelo texto
            </button>
          </div>
          {suportado && (
            <p className="mt-2 text-xs text-suave">
              No Chrome/Edge o áudio pode ser processado pelo serviço de reconhecimento de voz do navegador. Este site não grava nem envia seu
              áudio ou texto.
            </p>
          )}
          {erro && (
            <p role="alert" className="mt-2 rounded-lg border border-vermelho bg-white p-2 text-sm text-vermelho">{erro}</p>
          )}
          {analise?.nenhum && (
            <p role="status" className="mt-3 rounded-xl border border-ambar bg-white p-3 text-sm">
              Não reconheci nenhuma das nove áreas no seu texto. Cite ao menos uma (educação, família, segurança, economia, saúde, meio
              ambiente, transporte, minorias ou religião) ou mova as réguas abaixo.
            </p>
          )}
          {analise && analise.foraDeEscopo.length > 0 && (
            <p role="status" className="mt-3 rounded-xl border border-borda bg-white p-3 text-sm">
              Você também falou de <strong>{analise.foraDeEscopo.join(', ')}</strong>, que o site não avalia.
            </p>
          )}

          <h2 className="mt-8 text-xl font-extrabold text-petroleo">Entendi assim; ajuste se quiser</h2>
          <ul className="mt-3 space-y-4">
            {DEFS.map((d) => {
              const pos = valores[d.id]
              const citada = pos !== undefined
              const ex = exemploPara(d.id, pos ?? 0)
              const est = analise?.areas[d.id]
              return (
                <li key={d.id} className={`cartao p-4 ${citada ? '' : 'bg-fundo/60'}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <label htmlFor={`r-${d.id}`} className="font-bold">
                      {d.nome}
                      <span className="ml-2 text-sm font-normal text-suave">{d.resumo}</span>
                    </label>
                    <span className="text-sm font-bold text-petroleo">{citada ? rotuloPosicao(pos) : 'Não citada (neutro)'}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-suave">
                    <span className="w-24 shrink-0">Progressista</span>
                    <input
                      id={`r-${d.id}`}
                      type="range"
                      min={-100}
                      max={100}
                      step={5}
                      value={pos ?? 0}
                      aria-valuetext={citada ? `${rotuloPosicao(pos)} (${pos})` : 'Não citada, neutro'}
                      onChange={(e) => definirArea(d.id, Number(e.target.value))}
                      className={`h-8 w-full accent-[#0B3B4A] ${citada ? '' : 'opacity-50'}`}
                    />
                    <span className="w-24 shrink-0 text-right">Conservador</span>
                  </div>
                  <p className="mt-1 rounded-lg bg-fundo p-2 text-sm text-tinta">
                    <span className="mr-1 text-xs font-bold uppercase tracking-wide text-suave">{ex.rotulo}:</span>
                    “{ex.frase}”
                  </p>
                  {est && (
                    <p className="mt-1 text-xs text-suave">
                      {est.semLado ? 'Você falou desta área, mas não deu para saber o lado (deixei neutro). ' : ''}
                      Trecho(s): {est.evidencias.map((t) => `“${t}”`).join(' · ')}
                    </p>
                  )}
                  {citada && (
                    <button type="button" className="mt-2 text-sm font-semibold text-petroleo underline" onClick={() => definirArea(d.id, undefined)}>
                      Não quero citar esta área
                    </button>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn-sec" onClick={() => { limpar(); setAnalise(null) }} disabled={!temValores}>
              Limpar tudo
            </button>
            {temValores && <CopiarLink hash="/" rotulo="Copiar link com meus valores" />}
          </div>
          <p className="mt-4 text-sm text-suave">
            Seus valores e o texto ficam guardados <strong>só neste navegador</strong> (para você não repetir ao trocar de tela ou voltar depois) e
            no endereço da página (<code>?v=</code>), para compartilhar. Nada é enviado a servidor nem a cookies; “Limpar tudo” apaga. Como o
            texto vira posições: veja a <a className="font-semibold text-petroleo underline" href="#/metodologia">Metodologia</a>.
          </p>
        </div>

        <aside aria-label="Candidatos mais próximos" className="lg:sticky lg:top-4 lg:self-start">
          <h2 className="text-xl font-extrabold text-petroleo">Mais próximos de você</h2>
          <div className="mt-2 flex gap-2" role="group" aria-label="Cargo">
            {(['federal', 'estadual'] as const).map((k) => (
              <button key={k} type="button" aria-pressed={cargo === k} onClick={() => setCargo(k)} className={cargo === k ? 'btn' : 'btn-sec'}>
                {k === 'federal' ? 'Federal' : 'Estadual'}
              </button>
            ))}
          </div>
          {!temValores ? (
            <p className="mt-3 text-sm text-suave">Cite ou ajuste ao menos uma área para ver os candidatos mais próximos.</p>
          ) : (
            <>
              <p className="mt-3 text-xs text-suave" aria-live="polite">
                Considerando {citadas(valores).length} área(s) citada(s), entre todos os candidatos de SP.
              </p>
              <ul className="mt-2 space-y-3">{ranking.map((p) => <Cartao key={p.id} p={p} />)}</ul>
              <a className="btn mt-3 w-full" href="#/">Ver lista completa</a>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
