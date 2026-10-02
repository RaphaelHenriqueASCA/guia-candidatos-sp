import { useMemo, useState } from 'react'
import { BaseSelo } from '../components/Cartao'
import { Pesquisar } from '../components/Pesquisar'
import { BarraPosicao, Foto, Medidor, Numero } from '../components/Ui'
import { DEFS, rotuloPosicao } from '../lib/areas'
import { buscar, nomeLegivel, porId } from '../lib/dados'
import { useEstado } from '../lib/estado'
import { rotuloAfinidade } from '../lib/nota'
import { afinidade, citadas, posicaoCandidato } from '../lib/posicao'
import { analisarValores, sanitizar } from '../lib/valores'
import { CopiarLink } from './Ficha'

const veredito = (d: number) => (d <= 40 ? { t: 'Perto', c: 'text-verde' } : d <= 100 ? { t: 'Distante', c: 'text-ambar' } : { t: 'Opostos', c: 'text-vermelho' })

export function CompararMeus({ alvo }: { alvo?: string }) {
  const { valores, temValores, texto, setTexto, definirTodos } = useEstado()
  const [aviso, setAviso] = useState('')
  const [q, setQ] = useState('')
  const p = alvo ? porId(alvo) : undefined
  const resultados = useMemo(() => buscar(q, 8), [q])

  function posicionar() {
    const a = analisarValores(texto)
    if (a.nenhum) {
      setAviso('Não reconheci nenhuma das nove áreas no texto. Cite, por exemplo, educação, segurança ou transporte, ou ajuste as réguas em “Meus valores”.')
      return
    }
    setAviso('')
    const novo = { ...valores }
    for (const d of DEFS) {
      const e = a.areas[d.id]
      if (e) novo[d.id] = e.pos
    }
    definirTodos(novo)
  }

  const af = p && temValores ? afinidade(p, valores) : null
  const linhas = p
    ? DEFS.map((d) => ({ d, u: valores[d.id], c: posicaoCandidato(p, d.id) })).sort((x, y) => Number(y.u !== undefined) - Number(x.u !== undefined))
    : []
  const comparaveis = linhas.filter((l) => l.u !== undefined && l.c)
  const perto = comparaveis.filter((l) => Math.abs((l.u as number) - (l.c as { valor: number }).valor) <= 40).length

  return (
    <div className="space-y-8">
      <section aria-labelledby="meus">
        <h2 id="meus" className="text-xl font-extrabold text-petroleo">1. Seus valores</h2>
        <label htmlFor="texto-meus" className="mt-1 block text-sm text-suave">Escreva o que pensa (educação, família, segurança, economia, saúde, meio ambiente, transporte, minorias, religião)</label>
        <textarea
          id="texto-meus"
          rows={3}
          value={texto}
          onChange={(e) => setTexto(sanitizar(e.target.value))}
          placeholder="Ex.: Defendo a escola pública e tarifa zero, mas quero penas mais duras."
          className="mt-1 w-full rounded-xl border border-borda bg-white p-3 text-base"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button type="button" className="btn" onClick={posicionar} disabled={!texto.trim()}>Posicionar pelo texto</button>
          <a className="btn-sec" href="#/valores">Ajustar réguas ou ditar por voz</a>
        </div>
        {aviso && <p role="status" className="mt-2 rounded-lg border border-ambar bg-white p-2 text-sm">{aviso}</p>}
        <p className="mt-2 text-sm text-suave" aria-live="polite">
          {temValores
            ? `Áreas que você citou: ${citadas(valores).map((a) => `${DEFS.find((d) => d.id === a)!.nome} (${rotuloPosicao(valores[a] as number).toLowerCase()})`).join(', ')}.`
            : 'Você ainda não citou nenhuma área.'}
        </p>
      </section>

      <section aria-labelledby="quem">
        <h2 id="quem" className="text-xl font-extrabold text-petroleo">2. Escolha o candidato</h2>
        <label htmlFor="busca-cand" className="mt-1 block text-sm text-suave">Nome, número ou partido</label>
        <input
          id="busca-cand"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ex.: Keit Lima, 50300, PSOL"
          className="mt-1 min-h-11 w-full max-w-md rounded-xl border border-borda bg-white px-3 text-base"
        />
        {q.trim() && (
          <ul className="mt-2 max-w-md divide-y divide-borda rounded-xl border border-borda bg-white">
            {resultados.length === 0 && <li className="p-3 text-sm text-suave">Nenhum candidato encontrado.</li>}
            {resultados.map((r) => (
              <li key={r.id}>
                <a
                  href={`#/comparar/meus/${r.id}`}
                  onClick={() => setQ('')}
                  className="flex min-h-11 items-center justify-between gap-3 p-3 text-sm hover:bg-fundo"
                >
                  <span className="font-semibold">{nomeLegivel(r.nomeUrna)}{r.curado ? ' ★' : ''}</span>
                  <span className="text-suave">{r.partido} · {r.numero} · {r.cargo}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-1 text-xs text-suave">★ = candidato com curadoria (pesquisa com fontes).</p>
      </section>

      {p && (
        <section aria-labelledby="res" className="space-y-4">
          <h2 id="res" className="text-xl font-extrabold text-petroleo">3. Você × {nomeLegivel(p.nomeUrna)}</h2>
          <div className="cartao flex flex-wrap items-center gap-4 p-4">
            <Foto id={p.id} nome={nomeLegivel(p.nomeUrna)} className="h-24 w-20" />
            <div className="min-w-0 flex-1">
              <a href={`#/candidato/${p.id}`} className="text-lg font-extrabold underline">{nomeLegivel(p.nomeUrna)}</a>
              <div className="text-sm text-suave">{p.partido} · deputado {p.cargo}</div>
              <div className="mt-1"><BaseSelo p={p} /></div>
            </div>
            <Numero n={p.numero} className="text-4xl" />
          </div>

          {!temValores ? (
            <p className="rounded-xl border border-borda bg-white p-4 text-sm">Informe ao menos uma área no passo 1 para ver a comparação.</p>
          ) : (
            <>
              <div className="cartao space-y-2 p-4">
                <Medidor
                  titulo="Afinidade com os seus valores (estimativa)"
                  nota={af}
                  rotulo={af === null ? undefined : rotuloAfinidade(af)}
                  ajuda={af === null ? 'Não consegui estimar: o partido não tem classificação publicada.' : undefined}
                />
                {comparaveis.length > 0 && (
                  <p className="text-sm text-suave">
                    Nas {comparaveis.length} área(s) que você citou e em que o candidato tem posição, vocês estão <strong>perto</strong> em {perto} e
                    <strong> distantes ou opostos</strong> em {comparaveis.length - perto}.
                  </p>
                )}
              </div>
              <ul className="cartao divide-y divide-borda">
                {linhas.map(({ d, u, c }) => {
                  const dist = u !== undefined && c ? Math.abs(u - c.valor) : null
                  const v = dist === null ? null : veredito(dist)
                  return (
                    <li key={d.id} className="p-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-bold">{d.nome}</span>
                        {v ? <span className={`text-sm font-bold ${v.c}`}>{v.t} (diferença de {dist} em 200)</span> : <span className="text-sm text-suave">{u === undefined ? 'Você não citou (neutro)' : 'Candidato sem classificação'}</span>}
                      </div>
                      <div className="mt-2 space-y-2">
                        <div>
                          <div className="text-xs font-semibold text-suave">Você: {u === undefined ? 'não citada' : rotuloPosicao(u)}</div>
                          {u !== undefined && <BarraPosicao valor={u} rotulo={`${d.nome}: você`} cor="acento" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-suave">
                            Candidato: {c ? `${rotuloPosicao(c.valor)} · ${c.base === 'curadoria' ? 'curadoria' : 'estimada pelo partido'}` : 'sem classificação'}
                          </div>
                          {c && <BarraPosicao valor={c.valor} rotulo={`${d.nome}: ${nomeLegivel(p.nomeUrna)}`} />}
                          {c?.nota && <p className="mt-0.5 text-xs text-suave">{c.nota}</p>}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
              <p className="text-xs text-suave">Laranja: você · Azul: candidato. Posição de −100 (muito progressista) a +100 (muito conservador).</p>
            </>
          )}

          <div>
            <h3 className="mb-2 text-sm font-bold text-petroleo">Quer saber mais sobre este candidato?</h3>
            <Pesquisar p={p} />
          </div>
          <CopiarLink hash={`/comparar/meus/${p.id}`} rotulo="Copiar link desta comparação" />
        </section>
      )}
    </div>
  )
}
