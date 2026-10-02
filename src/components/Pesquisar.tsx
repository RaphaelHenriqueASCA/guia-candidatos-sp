import { useState } from 'react'
import type { Pessoa } from '../lib/dados'
import { useEstado } from '../lib/estado'
import { IAS, pedidoDePesquisa, urlNoticias, type IA } from '../lib/pesquisa'

/** Pesquisa sob demanda: o site é estático e sem IA, então a pesquisa roda no site da IA que a pessoa escolher. */
export function Pesquisar({ p }: { p: Pessoa }) {
  const { valores } = useEstado()
  const [aviso, setAviso] = useState('')

  async function copiar(texto: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(texto)
      return true
    } catch {
      window.prompt('Copie o pedido:', texto)
      return false
    }
  }

  async function copiarPedido() {
    await copiar(pedidoDePesquisa(p, valores))
    setAviso('Pedido copiado. Cole em qualquer IA com acesso à internet.')
  }

  async function abrir(ia: IA) {
    const pedido = pedidoDePesquisa(p, valores)
    if (ia.modo === 'copiar') await copiar(pedido)
    window.open(ia.url(pedido), '_blank', 'noopener,noreferrer')
    setAviso(
      ia.modo === 'link'
        ? `Abri o ${ia.nome} com a pesquisa. Confira as fontes que ele mostrar.`
        : `Pedido copiado e ${ia.nome} aberto: cole no campo de conversa (Ctrl+V).`,
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <a className="btn-sec" href={urlNoticias(p)} target="_blank" rel="noreferrer noopener">
          Buscar notícias (Google Notícias)
        </a>
        <button type="button" className="btn-sec" onClick={copiarPedido}>
          Copiar pedido para pesquisar fontes em uma IA
        </button>
      </div>

      <div>
        <h3 className="text-sm font-bold text-petroleo">Pesquisar agora em uma IA gratuita</h3>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {IAS.map((ia) => (
            <li key={ia.id} className="cartao p-3">
              <button type="button" className="btn w-full" onClick={() => abrir(ia)}>
                Pesquisar no {ia.nome}
              </button>
              <p className="mt-1 text-xs text-suave">{ia.nota}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 rounded-lg border border-borda bg-fundo p-2 text-xs text-suave">
          <strong>Privacidade:</strong> ao clicar, o nome do candidato e <strong>os valores que você informou</strong> são enviados ao site da IA
          escolhida, que segue a política dela. Este site não envia nada por conta própria. A IA pode errar: confira sempre as fontes.
        </p>
        <p role="status" className="mt-2 text-sm font-semibold text-verde" aria-live="polite">{aviso}</p>
      </div>
    </div>
  )
}
