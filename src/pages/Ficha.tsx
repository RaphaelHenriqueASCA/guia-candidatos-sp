import { useState } from 'react'
import { BaseSelo } from '../components/Cartao'
import { SecaoControversia } from '../components/Controversia'
import { Pesquisar } from '../components/Pesquisar'
import { destinoFeedback } from '../lib/pesquisa'
import { AvisoPesquisa, BarraPosicao, Foto, Medidor, Numero, Secao } from '../components/Ui'
import { DEFS, rotuloPosicao } from '../lib/areas'
import { formatarData, nomeLegivel, porId, type Pessoa } from '../lib/dados'
import { linkAtual, useEstado } from '../lib/estado'
import { rotuloAfinidade, rotuloDoc } from '../lib/nota'
import { afinidade, partidos, posicaoCandidato } from '../lib/posicao'

function destinoReportar(p: Pessoa) {
  return destinoFeedback({ id: p.id, rotulo: `${nomeLegivel(p.nomeUrna)} (${p.partido} ${p.numero})` })
}

export function CopiarLink({ hash, rotulo = 'Copiar link' }: { hash: string; rotulo?: string }) {
  const [ok, setOk] = useState(false)
  async function copiar() {
    const url = linkAtual(hash)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copie o link:', url)
    }
    setOk(true)
    setTimeout(() => setOk(false), 2000)
  }
  return (
    <button type="button" className="btn-sec" onClick={copiar}>
      {ok ? 'Link copiado ✓' : rotulo}
      <span role="status" className="sr-only">{ok ? 'Link copiado' : ''}</span>
    </button>
  )
}

/** Onde o candidato está em cada área, com a base de cada posição (curadoria ou partido). */
export function PosicoesPorArea({ p }: { p: Pessoa }) {
  const { valores } = useEstado()
  return (
    <ul className="cartao divide-y divide-borda">
      {DEFS.map((d) => {
        const c = posicaoCandidato(p, d.id)
        const u = valores[d.id]
        return (
          <li key={d.id} className="p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-bold">{d.nome}</span>
              <span className="text-sm text-suave">
                {c ? `${rotuloPosicao(c.valor)} · ${c.base === 'curadoria' ? 'curadoria' : 'estimada pelo partido'}` : 'sem classificação'}
              </span>
            </div>
            {c && <div className="mt-2"><BarraPosicao valor={c.valor} rotulo={`${d.nome}: ${nomeLegivel(p.nomeUrna)}`} /></div>}
            {u !== undefined && (
              <div className="mt-1">
                <BarraPosicao valor={u} rotulo={`${d.nome}: você`} cor="acento" />
                <p className="mt-0.5 text-xs text-suave">Laranja: você · Azul: candidato</p>
              </div>
            )}
            {c?.nota && <p className="mt-1 text-xs text-suave">{c.nota}</p>}
          </li>
        )
      })}
    </ul>
  )
}

export function Ficha({ id }: { id: string }) {
  const { valores, temValores } = useEstado()
  const p = porId(id)
  if (!p) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold">Candidato não encontrado</h1>
        <p className="mt-2"><a className="font-semibold text-petroleo underline" href="#/">Voltar ao início</a></p>
      </div>
    )
  }
  const c = p.curado
  const af = temValores ? afinidade(p, valores) : null
  const reportar = destinoReportar(p)
  const nome = nomeLegivel(p.nomeUrna)
  const info = partidos.partidos[p.partido]

  return (
    <article>
      <a href="#/" className="text-sm font-semibold text-petroleo underline">← Voltar</a>

      <div className="cartao mt-3 grid gap-6 p-5 md:grid-cols-[auto_1fr] md:p-6">
        <Foto id={p.id} nome={nome} className="h-56 w-44 md:h-64 md:w-48" />
        <div>
          <p className="text-sm font-semibold text-suave">Deputado {p.cargo} · {p.partido} · SP</p>
          <h1 className="text-3xl font-extrabold leading-tight">{nome}</h1>
          <div className="mt-1"><Numero n={p.numero} className="text-6xl" /></div>
          <div className="mt-2"><BaseSelo p={p} /></div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {temValores ? (
              <Medidor
                titulo="Afinidade com os seus valores (estimativa)"
                nota={af}
                rotulo={af === null ? undefined : rotuloAfinidade(af)}
                ajuda={af === null ? 'Não consegui estimar: o partido não tem classificação publicada.' : 'Baseada nas posições por área abaixo e nas áreas que você citou.'}
              />
            ) : (
              <p className="text-sm text-suave"><a className="font-semibold text-petroleo underline" href="#/valores">Informe seus valores</a> para ver a afinidade.</p>
            )}
            {c && <Medidor titulo="Documentação das fontes" nota={c.doc} rotulo={rotuloDoc(c.doc)} ajuda="Quão bem as informações desta ficha estão documentadas." />}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <CopiarLink hash={`/candidato/${p.id}`} />
            <a className="btn-sec" href={`#/comparar/${p.id}`}>Comparar</a>
            <a className="btn-sec" href={reportar.href} {...(reportar.externo ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>Reportar erro</a>
          </div>
        </div>
      </div>

      <div className="mt-4"><AvisoPesquisa /></div>

      {!c && (
        <p className="mt-4 rounded-xl border border-borda bg-white p-4 text-sm">
          Este candidato <strong>ainda não foi pesquisado</strong>: não há fatos, falas ou projetos aqui. Nome, número, partido e foto vêm do TSE, e a
          posição em cada área é apenas a <strong>estimativa pelo espectro do partido</strong> ({p.partido}
          {info?.lr != null ? `, ${info.lr.toString().replace('.', ',')} numa escala de 0 esquerda a 10 direita` : ', sem classificação publicada'}).
          Um candidato pode pensar diferente do seu partido.
        </p>
      )}

      <Secao titulo="Saiba mais sobre este candidato" id="mais">
        <Pesquisar p={p} />
        <p className="mt-2 text-sm text-suave">
          O site é estático e não pesquisa sozinho. O Google Notícias recebe só o nome do candidato. Nas IAs, o pedido já leva os seus valores e a
          pesquisa roda no site da IA escolhida.{' '}
          <a className="font-semibold text-petroleo underline" href={`#/comparar/meus/${p.id}`}>Comparar meus valores com ele</a>
        </p>
      </Secao>

      <Secao titulo="Índice de controvérsias" id="controversias">
        <SecaoControversia p={p} />
      </Secao>

      <Secao titulo="Onde está em cada área" id="areas">
        <PosicoesPorArea p={p} />
        <p className="mt-2 text-sm text-suave">
          Posição −100 (muito progressista) a +100 (muito conservador). “Curadoria” = baseada em falas/projetos pesquisados (veja as fontes);
          “estimada pelo partido” = espectro do partido segundo{' '}
          <a className="font-semibold text-petroleo underline" href={partidos.fonte.url} target="_blank" rel="noreferrer noopener">avaliação de cientistas políticos</a>{' '}
          e igual em todas as áreas.
        </p>
      </Secao>

      {c && (
        <>
          <div className="mt-2 grid gap-6 md:grid-cols-2">
            <Secao titulo="Pontos a favor" id="compat">
              {c.pontosCompativeis.length === 0 ? (
                <p className="text-suave">Nenhum ponto positivo encontrado na pesquisa.</p>
              ) : (
                <ul className="space-y-2">
                  {c.pontosCompativeis.map((t) => (
                    <li key={t} className="cartao p-3 text-sm before:mb-1 before:block before:text-xs before:font-bold before:text-verde before:content-['✓_A_favor']">{t}</li>
                  ))}
                </ul>
              )}
            </Secao>
            <Secao titulo="Pontos de atenção" id="conflito">
              {c.pontosConflito.length === 0 ? (
                <p className="text-suave">Nenhum ponto de atenção encontrado na pesquisa.</p>
              ) : (
                <ul className="space-y-2">
                  {c.pontosConflito.map((t) => (
                    <li key={t} className="cartao p-3 text-sm before:mb-1 before:block before:text-xs before:font-bold before:text-vermelho before:content-['!_Atenção']">{t}</li>
                  ))}
                </ul>
              )}
            </Secao>
          </div>

          <Secao titulo="Fontes" id="fontes">
            <p className="mb-2 text-sm text-suave">
              Origem: {c.origem}. Pesquisado em {formatarData(c.pesquisadoEm)}. Onde há defesa do candidato, ela está indicada no próprio ponto;
              quando não a encontrei, isso está dito.
            </p>
            <ul className="space-y-2">
              {c.fontes.map((f) => (
                <li key={f.url} className="cartao p-3 text-sm">
                  <a className="font-semibold text-petroleo underline" href={f.url} target="_blank" rel="noreferrer noopener">{f.titulo}</a>
                  <span className="text-suave"> · acessado em {formatarData(f.data)}</span>
                </li>
              ))}
            </ul>
          </Secao>
        </>
      )}
    </article>
  )
}
