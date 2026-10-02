import { useState } from 'react'
import type { Pessoa } from '../lib/dados'
import { useEstado } from '../lib/estado'
import { pedidoDePesquisa, urlNoticias } from '../lib/pesquisa'

/** Pesquisa sob demanda: o site é estático e sem IA, então a pesquisa roda no navegador/Claude da própria pessoa. */
export function Pesquisar({ p }: { p: Pessoa }) {
  const { valores } = useEstado()
  const [ok, setOk] = useState(false)
  async function copiar() {
    const texto = pedidoDePesquisa(p, valores)
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      window.prompt('Copie o pedido:', texto)
    }
    setOk(true)
    setTimeout(() => setOk(false), 2500)
  }
  return (
    <div className="flex flex-wrap gap-2">
      <a className="btn-sec" href={urlNoticias(p)} target="_blank" rel="noreferrer noopener">
        Buscar notícias (Google Notícias)
      </a>
      <button type="button" className="btn-sec" onClick={copiar}>
        {ok ? 'Pedido copiado ✓' : 'Copiar pedido para pesquisar no meu Claude'}
        <span role="status" className="sr-only">{ok ? 'Pedido copiado' : ''}</span>
      </button>
    </div>
  )
}
