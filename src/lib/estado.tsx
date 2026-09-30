import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { citadas, valoresDeQuery, valoresParaQuery, type Valores } from './posicao'
import type { Area } from './schema'

/** Hash atual sem o '#', ex.: '/candidato/federal-1300'. */
function lerRota(): string {
  return window.location.hash.replace(/^#/, '') || '/'
}

export function useRota(): string {
  const [rota, setRota] = useState(lerRota)
  useEffect(() => {
    const f = () => {
      setRota(lerRota())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return rota
}

type Ctx = {
  valores: Valores
  temValores: boolean
  definirArea: (a: Area, pos: number | undefined) => void
  definirTodos: (v: Valores) => void
  limpar: () => void
  comparar: string[]
  alternarComparar: (id: string) => void
}

const Contexto = createContext<Ctx | null>(null)

export function EstadoProvider({ children }: { children: ReactNode }) {
  const [valores, setValores] = useState<Valores>(() => valoresDeQuery(new URLSearchParams(window.location.search).get('v')))
  const [comparar, setComparar] = useState<string[]>([])

  // Os valores ficam só na URL (?v=educacao:-80,familia:60): sem cookies, sem servidor.
  useEffect(() => {
    const url = new URL(window.location.href)
    url.search = citadas(valores).length ? `?v=${valoresParaQuery(valores)}` : ''
    window.history.replaceState(null, '', url)
  }, [valores])

  const definirArea = useCallback((a: Area, pos: number | undefined) => {
    setValores((v) => {
      const n = { ...v }
      if (pos === undefined) delete n[a]
      else n[a] = pos
      return n
    })
  }, [])
  const definirTodos = useCallback((v: Valores) => setValores(v), [])
  const limpar = useCallback(() => setValores({}), [])
  const alternarComparar = useCallback(
    (id: string) => setComparar((l) => (l.includes(id) ? l.filter((x) => x !== id) : l.length >= 3 ? l : [...l, id])),
    [],
  )

  const valor = useMemo(
    () => ({ valores, temValores: citadas(valores).length > 0, definirArea, definirTodos, limpar, comparar, alternarComparar }),
    [valores, definirArea, definirTodos, limpar, comparar, alternarComparar],
  )
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useEstado(): Ctx {
  const c = useContext(Contexto)
  if (!c) throw new Error('EstadoProvider ausente')
  return c
}

/** Mantém o `?v=` ao montar links absolutos para compartilhar. */
export function linkAtual(hash: string): string {
  const url = new URL(window.location.href)
  url.hash = hash
  return url.toString()
}
