import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'
import { Cartao, notaEfetiva } from '../components/Cartao'
import { AvisoPesquisa } from '../components/Ui'
import { ELEICAO } from '../config'
import { candidatos } from '../lib/dados'
import { useEstado } from '../lib/estado'
import { normalizar } from '../lib/valores'
import type { Candidato } from '../lib/schema'

type Cargo = 'federal' | 'estadual'
type Ordem = 'padrao' | 'compativeis' | 'conflitantes'

const fuse = new Fuse(
  candidatos.map((c) => ({ c, nome: normalizar(c.nomeUrna), numero: c.numero, partido: normalizar(c.partido) })),
  { keys: ['nome', 'numero', 'partido'], threshold: 0.35, ignoreLocation: true },
)

export function Inicio() {
  const { pesos, personalizado, comparar } = useEstado()
  const [cargo, setCargo] = useState<Cargo>('federal')
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState<Ordem>('padrao')

  const lista = useMemo(() => {
    const q = normalizar(busca.trim())
    let base: Candidato[] = q ? fuse.search(q).map((r) => r.item.c) : candidatos
    base = base.filter((c) => c.cargo === cargo)
    if (ordem === 'padrao') return base
    const f = ordem === 'compativeis' ? -1 : 1
    return [...base].sort((a, b) => f * (notaEfetiva(a, pesos, personalizado) - notaEfetiva(b, pesos, personalizado)))
  }, [busca, cargo, ordem, pesos, personalizado])

  return (
    <div>
      <div className="rounded-cartao bg-petroleo p-6 text-white md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#F6B7A3]">Eleição de {ELEICAO} · São Paulo</p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight md:text-4xl">Compare candidatos com fatos e fontes</h1>
        <p className="mt-2 max-w-2xl text-white/90">
          Notas de compatibilidade com critérios definidos pela curadoria — ou com os <em>seus</em> valores. Cada ponto tem fonte e data.
        </p>
        <a href="#/valores" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-acento px-4 py-2 text-sm font-bold text-white hover:brightness-110">
          Informar meus valores
        </a>
      </div>

      <div className="mt-6">
        <AvisoPesquisa />
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end">
        <fieldset className="flex gap-2" aria-label="Cargo">
          {(['federal', 'estadual'] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={cargo === k}
              onClick={() => setCargo(k)}
              className={cargo === k ? 'btn' : 'btn-sec'}
            >
              Deputado {k}
            </button>
          ))}
        </fieldset>
        <div className="flex-1">
          <label htmlFor="busca" className="text-xs font-semibold text-suave">
            Buscar por nome, partido ou número
          </label>
          <input
            id="busca"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Ex.: Bebel, PT, 1300"
            className="mt-1 min-h-11 w-full rounded-xl border border-borda bg-white px-3 text-base"
          />
        </div>
        <div>
          <label htmlFor="ordem" className="text-xs font-semibold text-suave">
            Ordenar
          </label>
          <select
            id="ordem"
            value={ordem}
            onChange={(e) => setOrdem(e.target.value as Ordem)}
            className="mt-1 block min-h-11 w-full rounded-xl border border-borda bg-white px-3 text-base"
          >
            <option value="padrao">Ordem padrão</option>
            <option value="compativeis">Mais compatíveis</option>
            <option value="conflitantes">Mais conflitantes</option>
          </select>
        </div>
      </div>

      {personalizado && (
        <p className="mt-4 rounded-xl border border-borda bg-white px-4 py-3 text-sm" role="status">
          As notas abaixo usam <strong>os seus valores</strong> (estimativa). <a className="font-semibold text-petroleo underline" href="#/valores">Ajustar</a>
        </p>
      )}

      {comparar.length >= 2 && (
        <p className="mt-4">
          <a className="btn" href={`#/comparar/${comparar.join(',')}`}>
            Comparar {comparar.length} candidatos
          </a>
        </p>
      )}

      <h2 className="sr-only">Candidatos</h2>
      {lista.length === 0 ? (
        <p className="mt-8 text-suave">Nenhum candidato encontrado para essa busca. Este guia cobre só os candidatos já pesquisados.</p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((c) => (
            <Cartao key={c.id} c={c} />
          ))}
        </ul>
      )}
    </div>
  )
}
