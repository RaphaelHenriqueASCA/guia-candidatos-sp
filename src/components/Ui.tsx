import { useState, type ReactNode } from 'react'
import { DATA_PESQUISA } from '../config'
import { iniciais, urlFoto } from '../lib/dados'
import { faixa } from '../lib/nota'
import type { Candidato } from '../lib/schema'

export function Foto({ c, className = 'h-16 w-16' }: { c: Candidato; className?: string }) {
  const [falhou, setFalhou] = useState(false)
  if (falhou) {
    return (
      <div
        role="img"
        aria-label={`Sem foto oficial de ${c.nomeUrna}`}
        className={`${className} flex shrink-0 items-center justify-center rounded-2xl bg-petroleo text-lg font-bold text-white`}
      >
        {iniciais(c.nomeUrna)}
      </div>
    )
  }
  return (
    <img
      src={urlFoto(c)}
      alt={`Foto oficial de ${c.nomeUrna}, candidato a deputado ${c.cargo}, número ${c.numero} (TSE)`}
      loading="lazy"
      onError={() => setFalhou(true)}
      className={`${className} shrink-0 rounded-2xl border border-borda bg-fundo object-cover`}
    />
  )
}

const COR: Record<string, string> = { vermelho: 'text-vermelho', ambar: 'text-ambar', verde: 'text-verde' }
const BG: Record<string, string> = { vermelho: 'bg-vermelho', ambar: 'bg-ambar', verde: 'bg-verde' }

/** Medidor com número, faixa de cor e rótulo textual (nunca só cor). */
export function Medidor({ titulo, nota, rotulo, ajuda }: { titulo: string; nota: number | null; rotulo?: string; ajuda?: string }) {
  if (nota === null) {
    return (
      <div>
        <div className="text-xs font-semibold text-suave">{titulo}</div>
        <div className="text-sm font-semibold text-suave">Sem dados</div>
      </div>
    )
  }
  const f = faixa(nota)
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-suave">{titulo}</span>
        <span className={`text-sm font-bold ${COR[f.cor]}`}>
          {nota}/100 · {rotulo ?? f.rotulo}
        </span>
      </div>
      <div
        role="meter"
        aria-label={titulo}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={nota}
        aria-valuetext={`${nota} de 100, ${rotulo ?? f.rotulo}`}
        className="mt-1 h-2.5 overflow-hidden rounded-full bg-borda"
      >
        <div className={`medidor-barra h-full origin-left rounded-full ${BG[f.cor]}`} style={{ transform: `scaleX(${nota / 100})` }} />
      </div>
      {ajuda && <div className="mt-1 text-xs text-suave">{ajuda}</div>}
    </div>
  )
}

export function Numero({ n, className = 'text-3xl' }: { n: string; className?: string }) {
  return (
    <span className={`font-extrabold tabular-nums tracking-tight text-petroleo ${className}`} aria-label={`número ${n.split('').join(' ')}`}>
      {n}
    </span>
  )
}

export function AvisoPesquisa() {
  return (
    <p className="rounded-xl border border-borda bg-white px-4 py-3 text-sm text-suave">
      <strong className="text-tinta">Curadoria pessoal, pesquisada em {DATA_PESQUISA}.</strong> Confira as fontes. As notas são
      estimativas calculadas com os dados que encontrei; não são fatos nem uma medida objetiva.
    </p>
  )
}

export function Secao({ titulo, children, id }: { titulo: string; children: ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id} className="mt-8">
      <h2 id={id} className="mb-3 text-xl font-extrabold text-petroleo">
        {titulo}
      </h2>
      {children}
    </section>
  )
}

export function Aba({ href, ativa, children }: { href: string; ativa: boolean; children: ReactNode }) {
  return (
    <a
      href={href}
      aria-current={ativa ? 'page' : undefined}
      className={`rounded-lg px-3 py-2 text-sm font-semibold ${ativa ? 'bg-petroleo text-white' : 'text-petroleo hover:bg-white'}`}
    >
      {children}
    </a>
  )
}
