import { controversiaDe, formatarData, type Pessoa } from '../lib/dados'
import { faixa } from '../lib/nota'
import type { Julgamento } from '../lib/schema'

const ROTULO_JG: Record<Julgamento, string> = {
  deferido: 'Deferido',
  deferido_recurso: 'Deferido (cabe recurso)',
  indeferido: 'Indeferido',
  indeferido_recurso: 'Indeferido (em recurso)',
  renuncia: 'Renúncia',
}

// quanto menor o índice, melhor: a cor segue 100 - índice (verde = poucas controvérsias)
const COR: Record<string, string> = { vermelho: 'text-vermelho', ambar: 'text-ambar', verde: 'text-verde' }

/** Índice de controvérsias só como número em %, sem barra. `grande` = destaque na ficha. */
export function IndiceControversia({ p, grande = false }: { p: Pessoa; grande?: boolean }) {
  const { indice, pesquisado } = controversiaDe(p)
  const cor = indice === null ? 'text-suave' : COR[faixa(100 - indice).cor]
  return (
    <div
      className={grande ? 'inline-block rounded-2xl border border-borda bg-fundo px-4 py-2' : 'flex items-baseline justify-between gap-2'}
      title={!pesquisado && indice !== null ? 'Só considera a Ficha Limpa no TSE; processos não foram pesquisados.' : undefined}
    >
      <div className={grande ? 'text-xs font-semibold uppercase tracking-wide text-suave' : 'text-xs font-semibold text-suave'}>
        Índice de controvérsias
      </div>
      {indice === null ? (
        <div className={grande ? 'text-lg font-bold text-suave' : 'text-sm font-semibold text-suave'}>Não pesquisado</div>
      ) : (
        <div
          className={`font-extrabold tabular-nums leading-none ${cor} ${grande ? 'mt-1 text-6xl' : 'text-xl'}`}
          aria-label={`Índice de controvérsias: ${indice} por cento`}
        >
          {indice}%
        </div>
      )}
    </div>
  )
}

/** Seção da ficha: como ler o índice, ocorrências com peso e fonte, e situação do registro no TSE. */
export function SecaoControversia({ p }: { p: Pessoa }) {
  const c = controversiaDe(p)
  return (
    <div className="space-y-4">
      <div className="cartao p-4">
        <p className="text-sm text-suave">
          O índice (no topo da ficha) resume o que encontrei sobre <strong>processos e investigações</strong>, com pesos de 0 a 100 conforme a
          gravidade e o estágio (condenação administrativa ou enquadramento na Ficha Limpa pesam mais; investigação e citação, menos; arquivadas ou
          revertidas pesam zero) e menos peso para fatos antigos. <strong>Não é um julgamento</strong>: vale a presunção de inocência, e a ausência de
          ocorrências só quer dizer que não encontrei nenhuma, não que não existam. Veja o cálculo na{' '}
          <a className="font-semibold text-petroleo underline" href="#/metodologia">Metodologia</a>.
        </p>
        {p.jg && (
          <p className="mt-2 text-sm">
            <strong>Registro de candidatura no TSE (2026):</strong> {ROTULO_JG[p.jg]}.
          </p>
        )}
      </div>

      {c.itens.length > 0 ? (
        <ul className="space-y-2">
          {c.itens.map((i, k) => (
            <li key={k} className="cartao p-3 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-bold">{i.rotulo}{i.ano ? ` · ${i.ano}` : ''}</span>
                <span className="text-xs font-semibold text-suave">
                  {i.situacao} · peso {i.peso.toString().replace('.', ',')}/100
                </span>
              </div>
              <p className="mt-1">{i.detalhe}</p>
              {i.fonte && (
                <a className="mt-1 inline-block text-xs font-semibold text-petroleo underline" href={i.fonte} target="_blank" rel="noreferrer noopener">
                  Fonte (acessada em {formatarData('2026-10-02')})
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-suave">
          {p.curado ? 'Nenhuma ocorrência encontrada na pesquisa (que foi limitada às fontes listadas).' : 'Este candidato não foi pesquisado quanto a processos e investigações.'}
        </p>
      )}
    </div>
  )
}
