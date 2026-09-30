import { useState } from 'react'
import { AvisoPesquisa, Foto, Medidor, Numero, Secao } from '../components/Ui'
import { EMAIL_CONTATO, REPO_GITHUB } from '../config'
import { formatarData, porId } from '../lib/dados'
import { linkAtual, useEstado } from '../lib/estado'
import { CRITERIOS_INFO, notaPersonalizada, rotuloCompat, rotuloDoc } from '../lib/nota'
import { CRITERIOS, type Candidato } from '../lib/schema'

function urlReportar(c: Candidato): string | null {
  const titulo = `Erro na ficha: ${c.nomeUrna} (${c.id})`
  const corpo = `Ficha: ${linkAtual(`/candidato/${c.id}`)}\n\nO que está errado:\n\nFonte que confirma a correção (link):\n`
  if (REPO_GITHUB) {
    return `https://github.com/${REPO_GITHUB}/issues/new?title=${encodeURIComponent(titulo)}&body=${encodeURIComponent(corpo)}&labels=erro-na-ficha`
  }
  if (EMAIL_CONTATO) return `mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent(titulo)}&body=${encodeURIComponent(corpo)}`
  return null
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

export function Ficha({ id }: { id: string }) {
  const { pesos, personalizado } = useEstado()
  const c = porId(id)
  if (!c) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold">Candidato não encontrado</h1>
        <p className="mt-2">
          <a className="font-semibold text-petroleo underline" href="#/">Voltar ao início</a>
        </p>
      </div>
    )
  }
  const pers = notaPersonalizada(c, pesos)
  const reportar = urlReportar(c)

  return (
    <article>
      <a href="#/" className="text-sm font-semibold text-petroleo underline">← Voltar</a>

      <div className="cartao mt-3 grid gap-6 p-5 md:grid-cols-[auto_1fr] md:p-6">
        <Foto c={c} className="h-56 w-44 md:h-64 md:w-48" />
        <div>
          <p className="text-sm font-semibold text-suave">
            Deputado {c.cargo} · {c.partido} · SP
          </p>
          <h1 className="text-3xl font-extrabold leading-tight">{c.nomeUrna}</h1>
          <div className="mt-1">
            <Numero n={c.numero} className="text-6xl" />
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Medidor
              titulo="Compatibilidade estimada (curadoria)"
              nota={c.compat}
              rotulo={rotuloCompat(c.compat)}
              ajuda="Estimativa feita pelo autor com os dados que encontrou, pelos critérios da Metodologia."
            />
            <Medidor titulo="Documentação das fontes" nota={c.doc} rotulo={rotuloDoc(c.doc)} ajuda="Quão bem as informações abaixo estão documentadas." />
            {personalizado && (
              <div className="md:col-span-2">
                <Medidor
                  titulo="Compatibilidade com os seus valores (estimativa)"
                  nota={pers}
                  rotulo={pers === null ? undefined : rotuloCompat(pers)}
                  ajuda={pers === null ? 'Não há dados para os critérios que você escolheu.' : undefined}
                />
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <CopiarLink hash={`/candidato/${c.id}`} />
            <a className="btn-sec" href={`#/comparar/${c.id}`}>Comparar</a>
            {reportar && (
              <a className="btn-sec" href={reportar} target="_blank" rel="noreferrer noopener">
                Reportar erro
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <AvisoPesquisa />
      </div>

      <div className="mt-2 grid gap-6 md:grid-cols-2">
        <Secao titulo="Pontos compatíveis com os valores" id="compat">
          {c.pontosCompativeis.length === 0 ? (
            <p className="text-suave">Nenhum ponto compatível encontrado na pesquisa.</p>
          ) : (
            <ul className="space-y-2">
              {c.pontosCompativeis.map((p) => (
                <li key={p} className="cartao p-3 text-sm before:mb-1 before:block before:text-xs before:font-bold before:text-verde before:content-['✓_Compatível']">
                  {p}
                </li>
              ))}
            </ul>
          )}
        </Secao>
        <Secao titulo="Pontos de conflito" id="conflito">
          {c.pontosConflito.length === 0 ? (
            <p className="text-suave">Nenhum ponto de conflito encontrado na pesquisa.</p>
          ) : (
            <ul className="space-y-2">
              {c.pontosConflito.map((p) => (
                <li key={p} className="cartao p-3 text-sm before:mb-1 before:block before:text-xs before:font-bold before:text-vermelho before:content-['!_Conflito']">
                  {p}
                </li>
              ))}
            </ul>
          )}
        </Secao>
      </div>

      <Secao titulo="Notas por critério (estimativa da curadoria)" id="criterios">
        <div className="cartao grid gap-4 p-4 sm:grid-cols-2">
          {CRITERIOS.map((k) => (
            <Medidor
              key={k}
              titulo={CRITERIOS_INFO[k].descricao}
              nota={c.semDados.includes(k) ? null : c.criterios[k]}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-suave">
          “Sem dados” = não encontrei evidência para esse critério; ele fica fora do cálculo da sua nota personalizada.
        </p>
      </Secao>

      <Secao titulo="Fontes" id="fontes">
        <p className="mb-2 text-sm text-suave">
          Origem: {c.origem}. Pesquisado em {formatarData(c.pesquisadoEm)}. Cada ponto acima vem de uma ou mais destas fontes.
          Onde há defesa do candidato, ela está indicada no próprio ponto; quando não a encontrei, isso está dito.
        </p>
        <ul className="space-y-2">
          {c.fontes.map((f) => (
            <li key={f.url} className="cartao p-3 text-sm">
              <a className="font-semibold text-petroleo underline" href={f.url} target="_blank" rel="noreferrer noopener">
                {f.titulo}
              </a>
              <span className="text-suave"> · acessado em {formatarData(f.data)}</span>
            </li>
          ))}
        </ul>
      </Secao>
    </article>
  )
}
