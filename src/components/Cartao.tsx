import type { Pessoa } from '../lib/dados'
import { nomeLegivel } from '../lib/dados'
import { useEstado } from '../lib/estado'
import { rotuloAfinidade, rotuloDoc } from '../lib/nota'
import { afinidade, posicaoDoPartido } from '../lib/posicao'
import { IndiceControversia } from './Controversia'
import { Foto, Medidor, Numero } from './Ui'

export function BaseSelo({ p }: { p: Pessoa }) {
  const semClass = posicaoDoPartido(p.partido) === null
  return (
    <span className="inline-block rounded-full border border-borda bg-fundo px-2 py-0.5 text-xs font-semibold text-suave">
      {p.curado ? 'Com curadoria' : semClass ? 'Partido sem classificação' : 'Posição estimada pelo partido'}
    </span>
  )
}

export function Cartao({ p }: { p: Pessoa }) {
  const { valores, temValores, comparar, alternarComparar } = useEstado()
  const af = temValores ? afinidade(p, valores) : null
  const selecionado = comparar.includes(p.id)
  const cheio = !selecionado && comparar.length >= 3
  const nome = nomeLegivel(p.nomeUrna)

  return (
    <li className="cartao flex flex-col gap-3 p-4">
      <a href={`#/candidato/${p.id}`} className="flex items-center gap-4" aria-label={`Ver ficha de ${nome}, ${p.partido}, número ${p.numero}`}>
        <Foto id={p.id} nome={nome} className="h-20 w-16" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-extrabold leading-tight">{nome}</div>
          <div className="text-sm text-suave">{p.partido}</div>
        </div>
        <Numero n={p.numero} className="text-4xl" />
      </a>
      {temValores ? (
        <Medidor
          titulo="Afinidade com os seus valores (estimativa)"
          nota={af}
          rotulo={af === null ? undefined : rotuloAfinidade(af)}
          ajuda={af === null ? `Não consegui estimar: o partido ${p.partido} não tem classificação publicada.` : undefined}
        />
      ) : (
        <p className="text-sm text-suave">
          <a className="font-semibold text-petroleo underline" href="#/valores">Informe seus valores</a> para ver a afinidade.
        </p>
      )}
      {p.curado && <Medidor titulo="Documentação das fontes" nota={p.curado.doc} rotulo={rotuloDoc(p.curado.doc)} />}
      {(p.curado || p.fl) && <IndiceControversia p={p} />}
      <div className="flex items-center justify-between gap-2">
        <BaseSelo p={p} />
        <label className={`flex min-h-11 items-center gap-2 text-sm font-semibold text-petroleo ${cheio ? 'opacity-50' : ''}`}>
          <input type="checkbox" className="h-5 w-5 accent-[#0B3B4A]" checked={selecionado} disabled={cheio} onChange={() => alternarComparar(p.id)} />
          Comparar
        </label>
      </div>
    </li>
  )
}
