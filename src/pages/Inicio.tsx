import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'
import { Cartao } from '../components/Cartao'
import { AvisoPesquisa } from '../components/Ui'
import { ELEICAO } from '../config'
import { pessoas, type Pessoa } from '../lib/dados'
import { useEstado } from '../lib/estado'
import { afinidade } from '../lib/posicao'
import { normalizar } from '../lib/valores'

type Cargo = 'federal' | 'estadual'
type Ordem = 'afinidade' | 'distantes' | 'nome'

const fuse = new Fuse(
  pessoas.map((p) => ({ p, nome: normalizar(p.nomeUrna), numero: p.numero, partido: normalizar(p.partido) })),
  { keys: ['nome', 'numero', 'partido'], threshold: 0.3, ignoreLocation: true },
)

const PAGINA = 24

export function Inicio() {
  const { valores, temValores, comparar } = useEstado()
  const [cargo, setCargo] = useState<Cargo>('federal')
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState<Ordem>('afinidade')
  const [soCuradoria, setSoCuradoria] = useState(false)
  const [mostrar, setMostrar] = useState(PAGINA)

  const q = normalizar(busca.trim())
  // sem valores nem busca, mostra só os pesquisados; com valores ou busca, todos os candidatos de SP
  const todos = temValores || q.length > 0

  const lista = useMemo(() => {
    let base: Pessoa[] = q ? fuse.search(q, { limit: 400 }).map((r) => r.item.p) : pessoas
    base = base.filter((c) => c.cargo === cargo && (!todos || !soCuradoria || c.curado) && (todos || c.curado))
    const comAf = base.map((p) => ({ p, a: temValores ? afinidade(p, valores) : null }))
    if (ordem === 'nome' || !temValores) {
      if (ordem === 'nome') comAf.sort((x, y) => x.p.nomeUrna.localeCompare(y.p.nomeUrna))
    } else {
      const f = ordem === 'afinidade' ? -1 : 1
      comAf.sort((x, y) => f * ((x.a ?? (f < 0 ? -1 : 101)) - (y.a ?? (f < 0 ? -1 : 101))))
    }
    return comAf.map((x) => x.p)
  }, [q, cargo, todos, soCuradoria, ordem, valores, temValores])

  const visiveis = lista.slice(0, mostrar)

  return (
    <div>
      <div className="rounded-cartao bg-petroleo p-6 text-white md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#F6B7A3]">Eleição de {ELEICAO} · São Paulo</p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight md:text-4xl">Encontre candidatos pelos seus valores</h1>
        <p className="mt-2 max-w-2xl text-white/90">
          Diga o que pensa em áreas como educação, família e transporte. O site posiciona você entre progressista e conservador e mostra os
          candidatos de SP mais próximos, com fatos e fontes onde houve pesquisa.
        </p>
        <a href="#/valores" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-acento px-4 py-2 text-sm font-bold text-white hover:brightness-110">
          {temValores ? 'Ajustar meus valores' : 'Informar meus valores'}
        </a>
      </div>

      <div className="mt-6">
        <AvisoPesquisa />
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex gap-2" role="group" aria-label="Cargo">
          {(['federal', 'estadual'] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={cargo === k}
              onClick={() => { setCargo(k); setMostrar(PAGINA) }}
              className={cargo === k ? 'btn' : 'btn-sec'}
            >
              Deputado {k}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <label htmlFor="busca" className="text-xs font-semibold text-suave">
            Buscar entre todos os candidatos de SP (nome, partido ou número)
          </label>
          <input
            id="busca"
            type="search"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setMostrar(PAGINA) }}
            placeholder="Ex.: Bebel, PSOL, 1300"
            className="mt-1 min-h-11 w-full rounded-xl border border-borda bg-white px-3 text-base"
          />
        </div>
        <div>
          <label htmlFor="ordem" className="text-xs font-semibold text-suave">Ordenar</label>
          <select
            id="ordem"
            value={ordem}
            onChange={(e) => setOrdem(e.target.value as Ordem)}
            className="mt-1 block min-h-11 w-full rounded-xl border border-borda bg-white px-3 text-base"
          >
            <option value="afinidade" disabled={!temValores}>Mais afins com meus valores</option>
            <option value="distantes" disabled={!temValores}>Mais distantes dos meus valores</option>
            <option value="nome">Nome (A–Z)</option>
          </select>
        </div>
      </div>

      {todos && (
        <label className="mt-3 flex min-h-11 items-center gap-2 text-sm font-semibold text-petroleo">
          <input type="checkbox" className="h-5 w-5 accent-[#0B3B4A]" checked={soCuradoria} onChange={(e) => setSoCuradoria(e.target.checked)} />
          Só candidatos com curadoria (pesquisa com fontes)
        </label>
      )}

      {temValores ? (
        <p className="mt-3 rounded-xl border border-borda bg-white px-4 py-3 text-sm" role="status">
          Ordenado pela afinidade com <strong>os seus valores</strong>. <a className="font-semibold text-petroleo underline" href="#/valores">Ajustar</a>
        </p>
      ) : (
        <p className="mt-3 text-sm text-suave">
          Mostrando os candidatos pesquisados. Busque um nome para ver qualquer candidato de SP, ou{' '}
          <a className="font-semibold text-petroleo underline" href="#/valores">informe seus valores</a> para ver todos ordenados por afinidade.
        </p>
      )}

      {comparar.length >= 2 && (
        <p className="mt-4">
          <a className="btn" href={`#/comparar/${comparar.join(',')}`}>Comparar {comparar.length} candidatos</a>
        </p>
      )}

      <h2 className="sr-only">Candidatos</h2>
      {lista.length === 0 ? (
        <p className="mt-8 text-suave">Nenhum candidato encontrado.</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-suave" aria-live="polite">{lista.length} candidato(s).</p>
          <ul className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visiveis.map((p) => <Cartao key={p.id} p={p} />)}
          </ul>
          {lista.length > visiveis.length && (
            <p className="mt-6 text-center">
              <button type="button" className="btn-sec" onClick={() => setMostrar((m) => m + PAGINA)}>
                Mostrar mais ({lista.length - visiveis.length} restantes)
              </button>
            </p>
          )}
        </>
      )}
    </div>
  )
}
