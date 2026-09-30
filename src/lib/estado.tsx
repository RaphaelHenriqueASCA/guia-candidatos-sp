import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ehPadrao, normalizarPesos, PESOS_PADRAO, pesosDeQuery, pesosParaQuery, type Pesos } from './nota'

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
  pesos: Pesos
  personalizado: boolean
  aplicar: (p: Pesos) => void
  restaurar: () => void
  comparar: string[]
  alternarComparar: (id: string) => void
}

const Contexto = createContext<Ctx | null>(null)

export function EstadoProvider({ children }: { children: ReactNode }) {
  const [pesos, setPesos] = useState<Pesos>(() => pesosDeQuery(new URLSearchParams(window.location.search).get('w')) ?? PESOS_PADRAO)
  const [comparar, setComparar] = useState<string[]>([])

  // Pesos ficam só na URL (?w=40,30,20,10): sem cookies, sem servidor.
  const gravar = useCallback((p: Pesos) => {
    const url = new URL(window.location.href)
    url.search = ehPadrao(p) ? '' : `?w=${pesosParaQuery(p)}`
    window.history.replaceState(null, '', url)
  }, [])

  const aplicar = useCallback(
    (p: Pesos) => {
      const n = normalizarPesos(p)
      setPesos(n)
      gravar(n)
    },
    [gravar],
  )
  const restaurar = useCallback(() => aplicar(PESOS_PADRAO), [aplicar])
  const alternarComparar = useCallback(
    (id: string) => setComparar((l) => (l.includes(id) ? l.filter((x) => x !== id) : l.length >= 3 ? l : [...l, id])),
    [],
  )

  const valor = useMemo(
    () => ({ pesos, personalizado: !ehPadrao(pesos), aplicar, restaurar, comparar, alternarComparar }),
    [pesos, aplicar, restaurar, comparar, alternarComparar],
  )
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useEstado(): Ctx {
  const c = useContext(Contexto)
  if (!c) throw new Error('EstadoProvider ausente')
  return c
}

/** Mantém o `?w=` ao navegar e monta links absolutos para compartilhar. */
export function linkAtual(hash: string): string {
  const url = new URL(window.location.href)
  url.hash = hash
  return url.toString()
}
