import { BaseSelo } from '../components/Cartao'
import { BarraPosicao, Foto, Medidor, Numero } from '../components/Ui'
import { DEFS, rotuloPosicao } from '../lib/areas'
import { curadosLista, nomeLegivel, pessoas, porId, type Pessoa } from '../lib/dados'
import { useEstado } from '../lib/estado'
import { rotuloAfinidade } from '../lib/nota'
import { afinidade, posicaoCandidato } from '../lib/posicao'
import { CopiarLink } from './Ficha'

export function Comparar({ ids }: { ids: string[] }) {
  const { valores, temValores } = useEstado()
  const lista = ids.map(porId).filter((p): p is Pessoa => !!p).slice(0, 3)
  const opcoes = (lista.length ? pessoas.filter((p) => p.cargo === lista[0].cargo) : curadosLista).filter((p) => !lista.some((l) => l.id === p.id))
  const ordenadas = [...opcoes].sort((a, b) => Number(!!b.curado) - Number(!!a.curado) || a.nomeUrna.localeCompare(b.nomeUrna))

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-petroleo">Comparar candidatos</h1>
      <p className="mt-1 text-suave">Até 3 candidatos do mesmo cargo, lado a lado. Posições e afinidades são estimativas.</p>

      {lista.length < 3 && (
        <div className="mt-4">
          <label htmlFor="add" className="text-xs font-semibold text-suave">Adicionar candidato (os pesquisados aparecem primeiro)</label>
          <select
            id="add"
            className="mt-1 block min-h-11 w-full max-w-sm rounded-xl border border-borda bg-white px-3"
            value=""
            onChange={(e) => e.target.value && (window.location.hash = `/comparar/${[...lista.map((c) => c.id), e.target.value].join(',')}`)}
          >
            <option value="">Escolher…</option>
            {ordenadas.slice(0, 500).map((p) => (
              <option key={p.id} value={p.id}>{nomeLegivel(p.nomeUrna)} ({p.partido} {p.numero}){p.curado ? ' ★' : ''}</option>
            ))}
          </select>
        </div>
      )}

      {lista.length === 0 ? (
        <p className="mt-6">Escolha candidatos na <a className="font-semibold text-petroleo underline" href="#/">página inicial</a>.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {lista.map((p) => {
              const af = temValores ? afinidade(p, valores) : null
              const nome = nomeLegivel(p.nomeUrna)
              return (
                <section key={p.id} className="cartao space-y-4 p-4" aria-label={nome}>
                  <div className="flex items-center gap-3">
                    <Foto id={p.id} nome={nome} className="h-20 w-16" />
                    <div className="min-w-0 flex-1">
                      <a href={`#/candidato/${p.id}`} className="block font-extrabold underline">{nome}</a>
                      <div className="text-sm text-suave">{p.partido}</div>
                    </div>
                    <Numero n={p.numero} className="text-3xl" />
                  </div>
                  <BaseSelo p={p} />
                  {temValores && <Medidor titulo="Afinidade com os seus valores" nota={af} rotulo={af === null ? undefined : rotuloAfinidade(af)} ajuda="Sem classificação do partido" />}
                  <div className="space-y-3">
                    {DEFS.map((d) => {
                      const c = posicaoCandidato(p, d.id)
                      return (
                        <div key={d.id}>
                          <div className="flex justify-between gap-2 text-xs font-semibold text-suave">
                            <span>{d.nome}</span>
                            <span>{c ? `${rotuloPosicao(c.valor)}${c.base === 'curadoria' ? ' ★' : ''}` : 'sem classificação'}</span>
                          </div>
                          {c && <BarraPosicao valor={c.valor} rotulo={`${d.nome}: ${nome}`} />}
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-suave">★ = posição da curadoria; sem ★ = estimada pelo partido.</p>
                  {p.curado && (
                    <>
                      <div>
                        <h3 className="text-sm font-bold text-verde">A favor</h3>
                        {p.curado.pontosCompativeis.length ? (
                          <ul className="ml-4 list-disc text-sm">{p.curado.pontosCompativeis.map((t) => <li key={t}>{t}</li>)}</ul>
                        ) : <p className="text-sm text-suave">Nenhum encontrado.</p>}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-vermelho">Atenção</h3>
                        {p.curado.pontosConflito.length ? (
                          <ul className="ml-4 list-disc text-sm">{p.curado.pontosConflito.map((t) => <li key={t}>{t}</li>)}</ul>
                        ) : <p className="text-sm text-suave">Nenhum encontrado.</p>}
                      </div>
                    </>
                  )}
                  <a className="btn-sec w-full" href={`#/comparar/${lista.filter((x) => x.id !== p.id).map((x) => x.id).join(',')}`}>Remover da comparação</a>
                </section>
              )
            })}
          </div>
          <div className="mt-4"><CopiarLink hash={`/comparar/${lista.map((c) => c.id).join(',')}`} rotulo="Copiar link da comparação" /></div>
        </>
      )}
    </div>
  )
}
