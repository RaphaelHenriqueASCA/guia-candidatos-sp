import { Foto, Medidor, Numero } from '../components/Ui'
import { porId } from '../lib/dados'
import { useEstado } from '../lib/estado'
import { CRITERIOS_INFO, notaPersonalizada, rotuloCompat, rotuloDoc } from '../lib/nota'
import { CRITERIOS, type Candidato } from '../lib/schema'
import { candidatos } from '../lib/dados'
import { CopiarLink } from './Ficha'

export function Comparar({ ids }: { ids: string[] }) {
  const { personalizado, pesos } = useEstado()
  const lista = ids.map(porId).filter((c): c is Candidato => !!c).slice(0, 3)

  const adicionaveis = candidatos.filter((c) => !lista.some((l) => l.id === c.id) && (lista.length === 0 || c.cargo === lista[0].cargo))

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-petroleo">Comparar candidatos</h1>
      <p className="mt-1 text-suave">Até 3 candidatos do mesmo cargo, lado a lado. Notas são estimativas da curadoria.</p>

      {lista.length < 3 && adicionaveis.length > 0 && (
        <div className="mt-4">
          <label htmlFor="add" className="text-xs font-semibold text-suave">Adicionar candidato</label>
          <select
            id="add"
            className="mt-1 block min-h-11 w-full max-w-sm rounded-xl border border-borda bg-white px-3"
            value=""
            onChange={(e) => e.target.value && (window.location.hash = `/comparar/${[...lista.map((c) => c.id), e.target.value].join(',')}`)}
          >
            <option value="">Escolher…</option>
            {adicionaveis.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nomeUrna} ({c.partido} {c.numero})
              </option>
            ))}
          </select>
        </div>
      )}

      {lista.length === 0 ? (
        <p className="mt-6">Escolha candidatos na <a className="font-semibold text-petroleo underline" href="#/">página inicial</a>.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {lista.map((c) => {
              const pers = notaPersonalizada(c, pesos)
              return (
                <section key={c.id} className="cartao space-y-4 p-4" aria-label={c.nomeUrna}>
                  <div className="flex items-center gap-3">
                    <Foto c={c} className="h-20 w-16" />
                    <div className="min-w-0 flex-1">
                      <a href={`#/candidato/${c.id}`} className="block font-extrabold underline">{c.nomeUrna}</a>
                      <div className="text-sm text-suave">{c.partido}</div>
                    </div>
                    <Numero n={c.numero} className="text-3xl" />
                  </div>
                  <Medidor titulo="Compatibilidade (curadoria)" nota={c.compat} rotulo={rotuloCompat(c.compat)} />
                  {personalizado && (
                    <Medidor
                      titulo="Com os seus valores"
                      nota={pers}
                      rotulo={pers === null ? undefined : rotuloCompat(pers)}
                    />
                  )}
                  <Medidor titulo="Documentação" nota={c.doc} rotulo={rotuloDoc(c.doc)} />
                  {CRITERIOS.map((k) => (
                    <Medidor key={k} titulo={CRITERIOS_INFO[k].nome} nota={c.semDados.includes(k) ? null : c.criterios[k]} />
                  ))}
                  <div>
                    <h3 className="text-sm font-bold text-verde">Compatíveis</h3>
                    {c.pontosCompativeis.length ? (
                      <ul className="ml-4 list-disc text-sm">{c.pontosCompativeis.map((p) => <li key={p}>{p}</li>)}</ul>
                    ) : (
                      <p className="text-sm text-suave">Nenhum encontrado.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-vermelho">Conflitos</h3>
                    {c.pontosConflito.length ? (
                      <ul className="ml-4 list-disc text-sm">{c.pontosConflito.map((p) => <li key={p}>{p}</li>)}</ul>
                    ) : (
                      <p className="text-sm text-suave">Nenhum encontrado.</p>
                    )}
                  </div>
                  <a className="btn-sec w-full" href={`#/comparar/${lista.filter((x) => x.id !== c.id).map((x) => x.id).join(',')}`}>
                    Remover da comparação
                  </a>
                </section>
              )
            })}
          </div>
          <div className="mt-4">
            <CopiarLink hash={`/comparar/${lista.map((c) => c.id).join(',')}`} rotulo="Copiar link da comparação" />
          </div>
        </>
      )}
    </div>
  )
}
