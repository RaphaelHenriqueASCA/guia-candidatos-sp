import { useState } from 'react'
import { Secao } from '../components/Ui'
import { ditadoSuportado, useDitado } from '../lib/ditado'
import { algumAtivo, CRITERIOS_INFO, normalizarPesos, PESOS_PADRAO, type Pesos } from '../lib/nota'
import { CRITERIOS, type Criterio } from '../lib/schema'
import { useEstado } from '../lib/estado'
import { analisarValores, sanitizar, type Analise } from '../lib/valores'
import { CopiarLink } from './Ficha'

const VAZIO: Pesos = { educacao: 0, minorias: 0, periferia: 0, midia: 0 }

export function Valores() {
  const { pesos, personalizado, aplicar, restaurar } = useEstado()
  const [texto, setTexto] = useState('')
  const [parcial, setParcial] = useState('')
  const [rascunho, setRascunho] = useState<Pesos>(personalizado ? pesos : VAZIO)
  const [analise, setAnalise] = useState<Analise | null>(null)
  const [aplicado, setAplicado] = useState(false)

  const suportado = ditadoSuportado()
  const { gravando, erro, iniciar, parar } = useDitado(
    (t) => setTexto((atual) => sanitizar((atual ? atual.replace(/\s*$/, ' ') : '') + t)),
    setParcial,
  )

  function entender() {
    parar()
    const a = analisarValores(texto)
    setAnalise(a)
    setAplicado(false)
    if (!a.nenhum) setRascunho(a.pesos)
  }

  const normalizado = normalizarPesos(rascunho)
  const pode = algumAtivo(rascunho)
  const semCriterio = analise?.nenhum

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-extrabold text-petroleo">Meus valores</h1>
      <p className="mt-1 text-suave">
        Conte o que é importante para você ao votar. O site só avalia quatro critérios (educação, minorias, periferia e baixa
        exposição midiática) e você pode falar de um só, de alguns ou de todos.
      </p>

      <div className="mt-5">
        <label htmlFor="valores" className="text-base font-bold">
          Conte o que é importante para você ao votar
        </label>
        <textarea
          id="valores"
          rows={6}
          value={texto}
          onChange={(e) => setTexto(sanitizar(e.target.value))}
          placeholder="Ex.: Quero alguém da periferia que defenda a escola pública e os professores."
          className="mt-2 w-full rounded-xl border border-borda bg-white p-3 text-base"
        />
        {parcial && (
          <p className="mt-1 text-sm italic text-suave" aria-live="polite">
            Ouvindo: {parcial}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {suportado ? (
            <button
              type="button"
              onClick={gravando ? parar : iniciar}
              aria-pressed={gravando}
              aria-label={gravando ? 'Parar de gravar' : 'Ditar por voz'}
              className={gravando ? 'btn bg-vermelho hover:bg-vermelho' : 'btn-sec'}
            >
              <span aria-hidden="true">{gravando ? '■' : '🎤'}</span>
              {gravando ? 'Gravando… toque para parar' : 'Ditar por voz'}
            </button>
          ) : (
            <p className="text-sm text-suave" role="note">Ditado não disponível neste navegador; digite seus valores.</p>
          )}
          <button type="button" className="btn" onClick={entender} disabled={texto.trim().length === 0}>
            Entender meus valores
          </button>
        </div>

        {suportado && (
          <p className="mt-2 text-xs text-suave">
            No Chrome/Edge o áudio pode ser processado pelo serviço de reconhecimento de voz do navegador. Este site não grava
            nem envia seu áudio ou texto.
          </p>
        )}
        {erro && (
          <p role="alert" className="mt-2 rounded-lg border border-vermelho bg-white p-2 text-sm text-vermelho">
            {erro}
          </p>
        )}
      </div>

      {semCriterio && (
        <p role="status" className="mt-4 rounded-xl border border-ambar bg-white p-3 text-sm">
          Não identifiquei nenhum dos quatro critérios no seu texto. Diga ao menos um valor (por exemplo: “educação”, “minorias”,
          “periferia” ou “discreto”) ou ajuste os controles abaixo. Enquanto isso, valem as notas padrão da curadoria.
        </p>
      )}
      {analise && analise.foraDeEscopo.length > 0 && (
        <p role="status" className="mt-4 rounded-xl border border-borda bg-white p-3 text-sm">
          Você também falou de <strong>{analise.foraDeEscopo.join(', ')}</strong>. O site só avalia os quatro critérios abaixo;
          ajuste-os manualmente se quiser.
        </p>
      )}

      <Secao titulo="Entendi assim; ajuste se quiser" id="ajuste">
        <div className="cartao space-y-5 p-4">
          {CRITERIOS.map((k: Criterio) => (
            <div key={k}>
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor={`peso-${k}`} className="font-bold">
                  {CRITERIOS_INFO[k].nome}
                  <span className="ml-2 text-sm font-normal text-suave">{CRITERIOS_INFO[k].descricao}</span>
                </label>
                <span className="text-sm font-bold tabular-nums text-petroleo">{pode ? `${normalizado[k]}%` : '—'}</span>
              </div>
              <input
                id={`peso-${k}`}
                type="range"
                min={0}
                max={100}
                step={5}
                value={rascunho[k]}
                onChange={(e) => {
                  setAplicado(false)
                  setRascunho({ ...rascunho, [k]: Number(e.target.value) })
                }}
                className="mt-1 h-8 w-full accent-[#0B3B4A]"
              />
              {analise && analise.evidencias[k].length > 0 && (
                <p className="text-xs text-suave">
                  Trecho(s) que acionaram: {analise.evidencias[k].map((t) => `“${t}”`).join(' · ')}
                </p>
              )}
              {rascunho[k] === 0 && <p className="text-xs text-suave">Fora do cálculo (peso 0).</p>}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn"
            disabled={!pode}
            onClick={() => {
              aplicar(rascunho)
              setAplicado(true)
            }}
          >
            Aplicar aos candidatos
          </button>
          <button
            type="button"
            className="btn-sec"
            onClick={() => {
              restaurar()
              setRascunho(PESOS_PADRAO)
              setAnalise(null)
              setAplicado(false)
            }}
          >
            Restaurar critérios do autor
          </button>
          {personalizado && <CopiarLink hash="/" rotulo="Copiar link com meus valores" />}
        </div>
        {!pode && <p className="mt-2 text-sm text-suave">Ao menos um critério precisa ter peso maior que zero para aplicar.</p>}
        {aplicado && (
          <p role="status" className="mt-3 text-sm font-semibold text-verde">
            Aplicado. <a className="underline" href="#/">Ver candidatos</a>
          </p>
        )}
      </Secao>

      <p className="mt-6 text-sm text-suave">
        Os pesos ficam só no endereço da página (<code>?w=</code>), para você poder compartilhar. Nada é salvo em cookies nem enviado a servidor.
        Como o texto vira pesos: veja a <a className="font-semibold text-petroleo underline" href="#/metodologia">Metodologia</a>.
      </p>
    </div>
  )
}
