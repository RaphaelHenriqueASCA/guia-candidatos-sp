import { useCallback, useEffect, useRef, useState } from 'react'

// Web Speech API não está nos tipos do DOM padrão.
type Reconhecedor = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

function construtor(): (new () => Reconhecedor) | null {
  const w = window as unknown as { SpeechRecognition?: new () => Reconhecedor; webkitSpeechRecognition?: new () => Reconhecedor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function ditadoSuportado(): boolean {
  return typeof window !== 'undefined' && construtor() !== null
}

export function mensagemErro(codigo: string): string {
  switch (codigo) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Permissão do microfone negada. Libere o microfone nas configurações do navegador ou digite seus valores.'
    case 'network':
      return 'Erro de rede no reconhecimento de voz. Verifique sua conexão ou digite seus valores.'
    case 'no-speech':
      return 'Não ouvi nada. Tente de novo, falando perto do microfone.'
    case 'audio-capture':
      return 'Nenhum microfone encontrado. Digite seus valores.'
    default:
      return 'Não foi possível usar o ditado agora. Digite seus valores.'
  }
}

/** Ditado por voz (pt-BR) com resultados parciais. `aoTexto` recebe o texto final ditado e o parcial em andamento. */
export function useDitado(aoFinal: (texto: string) => void, aoParcial: (texto: string) => void) {
  const [gravando, setGravando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const rec = useRef<Reconhecedor | null>(null)
  const cbFinal = useRef(aoFinal)
  const cbParcial = useRef(aoParcial)
  cbFinal.current = aoFinal
  cbParcial.current = aoParcial

  const parar = useCallback(() => rec.current?.stop(), [])

  const iniciar = useCallback(() => {
    const C = construtor()
    if (!C) return
    setErro(null)
    const r = new C()
    r.lang = 'pt-BR'
    r.continuous = true
    r.interimResults = true
    r.onresult = (e) => {
      let parcial = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) cbFinal.current(t.trim())
        else parcial += t
      }
      cbParcial.current(parcial)
    }
    r.onerror = (e) => setErro(mensagemErro(e.error))
    r.onend = () => {
      setGravando(false)
      cbParcial.current('')
    }
    rec.current = r
    try {
      r.start()
      setGravando(true)
    } catch {
      setErro(mensagemErro('other'))
    }
  }, [])

  useEffect(() => () => rec.current?.abort(), [])

  return { gravando, erro, iniciar, parar }
}
