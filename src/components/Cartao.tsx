import { notaPersonalizada, rotuloCompat, rotuloDoc } from '../lib/nota'
import type { Candidato } from '../lib/schema'
import { useEstado } from '../lib/estado'
import { Foto, Medidor, Numero } from './Ui'

export function notaEfetiva(c: Candidato, pesos: Parameters<typeof notaPersonalizada>[1], personalizado: boolean): number {
  return (personalizado ? notaPersonalizada(c, pesos) : null) ?? c.compat
}

export function Cartao({ c }: { c: Candidato }) {
  const { pesos, personalizado, comparar, alternarComparar } = useEstado()
  const pers = personalizado ? notaPersonalizada(c, pesos) : null
  const nota = pers ?? c.compat
  const selecionado = comparar.includes(c.id)
  const cheio = !selecionado && comparar.length >= 3

  return (
    <li className="cartao flex flex-col gap-4 p-4">
      <a href={`#/candidato/${c.id}`} className="flex items-center gap-4" aria-label={`Ver ficha de ${c.nomeUrna}, ${c.partido}, número ${c.numero}`}>
        <Foto c={c} className="h-20 w-16" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-extrabold leading-tight">{c.nomeUrna}</div>
          <div className="text-sm text-suave">{c.partido}</div>
        </div>
        <Numero n={c.numero} className="text-4xl" />
      </a>
      <Medidor
        titulo={personalizado ? 'Compatibilidade com os seus valores (estimativa)' : 'Compatibilidade estimada (curadoria)'}
        nota={personalizado && pers === null ? null : nota}
        rotulo={rotuloCompat(nota)}
        ajuda={personalizado && pers === null ? `Sem dados para os critérios escolhidos. Curadoria: ${c.compat}/100.` : undefined}
      />
      <Medidor titulo="Documentação das fontes" nota={c.doc} rotulo={rotuloDoc(c.doc)} />
      <label className={`flex min-h-11 items-center gap-2 text-sm font-semibold text-petroleo ${cheio ? 'opacity-50' : ''}`}>
        <input
          type="checkbox"
          className="h-5 w-5 accent-[#0B3B4A]"
          checked={selecionado}
          disabled={cheio}
          onChange={() => alternarComparar(c.id)}
        />
        Comparar {cheio ? '(máximo de 3)' : ''}
      </label>
    </li>
  )
}
