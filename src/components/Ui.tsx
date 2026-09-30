import { useState, type ReactNode } from 'react'
import { DATA_PESQUISA } from '../config'
import { iniciais, urlFoto } from '../lib/dados'
import { faixa } from '../lib/nota'

export function Foto({ id, nome, className = 'h-16 w-16' }: { id: string; nome: string; className?: string }) {
  const [falhou, setFalhou] = useState(false)
  if (falhou) {
    return (
      <div
        role="img"
        aria-label={`Sem foto oficial de ${nome}`}
        className={`${className} flex shrink-0 items-center justify-center rounded-2xl bg-petroleo text-lg font-bold text-white`}
      >
        {iniciais(nome)}
      </div>
    )
  }
  return (
    <img
      src={urlFoto(id)}
      alt={`Foto oficial de ${nome} (TSE)`}
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
        <div className="text-sm font-semibold text-suave">{ajuda ?? 'Sem dados'}</div>
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
      <strong className="text-tinta">Curadoria pessoal, pesquisada em {DATA_PESQUISA}.</strong> Confira as fontes. Afinidades e posições são
      estimativas com os dados que encontrei; não são fatos nem uma medida objetiva.
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

/** Barra estática -100…+100 com marcador: onde está um candidato (ou a pessoa) entre progressista e conservador. */
export function BarraPosicao({ valor, rotulo, cor = 'petroleo' }: { valor: number; rotulo: string; cor?: 'petroleo' | 'acento' }) {
  const pct = (valor + 100) / 2
  return (
    <div
      role="img"
      aria-label={`${rotulo}: ${valor > 0 ? '+' : ''}${valor} numa escala de -100 (progressista) a +100 (conservador)`}
      className="relative h-3 rounded-full bg-gradient-to-r from-[#0B3B4A]/25 via-borda to-[#B54708]/25"
    >
      <div className="absolute left-1/2 top-0 h-3 w-px bg-suave/50" />
      <div
        className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${cor === 'acento' ? 'bg-acento' : 'bg-petroleo'} shadow`}
        style={{ left: `${pct}%` }}
      />
    </div>
  )
}
