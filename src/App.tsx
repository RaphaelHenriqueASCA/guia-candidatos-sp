import { Aba } from './components/Ui'
import { EstadoProvider, useRota } from './lib/estado'
import { Comparar } from './pages/Comparar'
import { Ficha } from './pages/Ficha'
import { Inicio } from './pages/Inicio'
import { Metodologia } from './pages/Metodologia'
import { Valores } from './pages/Valores'

function Rotas() {
  const rota = useRota()
  const [, secao, resto, extra] = rota.split('?')[0].split('/')
  let pagina
  if (secao === 'candidato') pagina = <Ficha id={resto ?? ''} />
  else if (secao === 'comparar' && resto === 'meus') pagina = <Comparar ids={[]} modo="meus" alvo={extra} />
  else if (secao === 'comparar') pagina = <Comparar ids={(resto ?? '').split(',').filter(Boolean)} />
  else if (secao === 'valores') pagina = <Valores />
  else if (secao === 'metodologia') pagina = <Metodologia />
  else pagina = <Inicio />

  return (
    <>
      <header className="border-b border-borda bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <a href="#/" className="text-lg font-extrabold text-petroleo">Guia de Candidatos SP 2026</a>
          <nav aria-label="Principal" className="flex flex-wrap gap-1">
            <Aba href="#/" ativa={!secao}>Candidatos</Aba>
            <Aba href="#/valores" ativa={secao === 'valores'}>Meus valores</Aba>
            <Aba href="#/comparar" ativa={secao === 'comparar'}>Comparar</Aba>
            <Aba href="#/metodologia" ativa={secao === 'metodologia'}>Metodologia</Aba>
          </nav>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6">{pagina}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-suave">
        Curadoria pessoal, pesquisada em 29/09/2026 · Origem: curadoria inicial · Fotos e números: TSE (dados abertos) · Sem cookies nem rastreamento.
      </footer>
    </>
  )
}

export default function App() {
  return (
    <EstadoProvider>
      <a href="#conteudo" onClick={(e) => { e.preventDefault(); document.getElementById('conteudo')?.focus() }} className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded focus:bg-white focus:p-2">
        Pular para o conteúdo
      </a>
      <Rotas />
    </EstadoProvider>
  )
}
