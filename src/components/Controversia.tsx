import { controversiaDe, formatarData, type Pessoa } from '../lib/dados'
import { rotuloIndice } from '../lib/controversia'
import type { Julgamento } from '../lib/schema'
import { Medidor } from './Ui'

const ROTULO_JG: Record<Julgamento, string> = {
  deferido: 'Deferido',
  deferido_recurso: 'Deferido (cabe recurso)',
  indeferido: 'Indeferido',
  indeferido_recurso: 'Indeferido (em recurso)',
  renuncia: 'Renúncia',
}

/** Medidor compacto do índice de controvérsias (cores invertidas: verde = menos controvérsias). */
export function MedidorControversia({ p }: { p: Pessoa }) {
  const c = controversiaDe(p)
  if (c.indice === null) {
    return (
      <div>
        <div className="text-xs font-semibold text-suave">Índice de controvérsias</div>
        <div className="text-sm text-suave">Não pesquisado (sem dados de processos para este candidato).</div>
      </div>
    )
  }
  return (
    <Medidor
      titulo="Índice de controvérsias (processos e investigações)"
      nota={c.indice}
      rotulo={rotuloIndice(c.indice)}
      invertida
      ajuda={!c.pesquisado ? 'Só considera a Ficha Limpa no TSE; processos não foram pesquisados.' : undefined}
    />
  )
}

/** Seção completa da ficha: índice, ocorrências com peso e fonte, e situação do registro no TSE. */
export function SecaoControversia({ p }: { p: Pessoa }) {
  const c = controversiaDe(p)
  return (
    <div className="space-y-4">
      <div className="cartao p-4">
        <MedidorControversia p={p} />
        <p className="mt-3 text-sm text-suave">
          O índice resume o que encontrei sobre <strong>processos e investigações</strong>, com pesos de 0 a 100 conforme a gravidade e o estágio
          (condenação administrativa ou enquadramento na Ficha Limpa pesam mais; investigação e citação, menos; arquivadas ou revertidas pesam zero) e
          menos peso para fatos antigos. <strong>Não é um julgamento</strong>: vale a presunção de inocência, e a ausência de ocorrências só quer
          dizer que não encontrei nenhuma, não que não existam. Veja o cálculo na <a className="font-semibold text-petroleo underline" href="#/metodologia">Metodologia</a>.
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
