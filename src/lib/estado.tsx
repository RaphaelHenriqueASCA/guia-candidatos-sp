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

// Guardado só neste navegador (localStorage), nunca enviado a servidor. Pode falhar (janela privada etc.).
const CHAVE_VALORES = 'guia-sp.valores'
const CHAVE_TEXTO = 'guia-sp.texto'
const ler = (k: string): string | null => {
  try {
    return window.localStorage.getItem(k)
  } catch {
    return null
  }
}
const gravar = (k: string, v: string) => {
  try {
    if (v) window.localStorage.setItem(k, v)
    else window.localStorage.removeItem(k)
  } catch {
    /* sem armazenamento: o site continua funcionando só com a URL */
  }
}

type Ctx = {
  valores: Valores
  temValores: boolean
  /** Texto que a pessoa escreveu/ditou, guardado para não precisar repetir ao trocar de tela. */
  texto: string
  setTexto: (t: string | ((atual: string) => string)) => void
  definirArea: (a: Area, pos: number | undefined) => void
  definirTodos: (v: Valores) => void
  limpar: () => void
  comparar: string[]
  alternarComparar: (id: string) => void
}

const Contexto = createContext<Ctx | null>(null)

export function EstadoProvider({ children }: { children: ReactNode }) {
  const [valores, setValores] = useState<Valores>(() => {
    const daUrl = valoresDeQuery(new URLSearchParams(window.location.search).get('v'))
    return citadas(daUrl).length ? daUrl : valoresDeQuery(ler(CHAVE_VALORES))
  })
  const [texto, setTexto] = useState<string>(() => ler(CHAVE_TEXTO) ?? '')
  const [comparar, setComparar] = useState<string[]>([])

  // Os valores ficam na URL (?v=educacao:-80,familia:60, para compartilhar) e neste navegador.
  useEffect(() => {
    const q = valoresParaQuery(valores)
    const url = new URL(window.location.href)
    url.search = q ? `?v=${q}` : ''
    window.history.replaceState(null, '', url)
    gravar(CHAVE_VALORES, q)
  }, [valores])
  useEffect(() => gravar(CHAVE_TEXTO, texto), [texto])

  const definirArea = useCallback((a: Area, pos: number | undefined) => {
    setValores((v) => {
      const n = { ...v }
      if (pos === undefined) delete n[a]
      else n[a] = pos
      return n
    })
  }, [])
  const definirTodos = useCallback((v: Valores) => setValores(v), [])
  const limpar = useCallback(() => {
    setValores({})
    setTexto('')
  }, [])
  const alternarComparar = useCallback(
    (id: string) => setComparar((l) => (l.includes(id) ? l.filter((x) => x !== id) : l.length >= 3 ? l : [...l, id])),
    [],
  )

  const valor = useMemo(
    () => ({ valores, temValores: citadas(valores).length > 0, texto, setTexto, definirArea, definirTodos, limpar, comparar, alternarComparar }),
    [valores, texto, definirArea, definirTodos, limpar, comparar, alternarComparar],
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
