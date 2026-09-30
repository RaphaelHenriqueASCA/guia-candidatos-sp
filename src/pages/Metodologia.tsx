import { DATA_PESQUISA } from '../config'
import { Secao } from '../components/Ui'

export function Metodologia() {
  return (
    <div className="max-w-3xl space-y-2">
      <h1 className="text-3xl font-extrabold text-petroleo">Metodologia</h1>
      <p className="text-suave">
        Curadoria pessoal, pesquisada em {DATA_PESQUISA}. Origem dos dados: “curadoria inicial”. Ninguém pagou por este guia e ele não usa
        anúncios, cookies de rastreamento nem inteligência artificial no seu navegador.
      </p>

      <Secao titulo="Critérios do autor (em ordem de prioridade)" id="m-criterios">
        <ol className="ml-5 list-decimal space-y-1">
          <li>Educação progressista e respeito aos professores (peso padrão 40)</li>
          <li>Empatia com causas das minorias (30)</li>
          <li>Origem na periferia e projetos populares (20)</li>
          <li>Baixa exposição midiática (10)</li>
        </ol>
        <p className="mt-2 text-suave">
          São valores do autor, não verdades universais. Por isso existe a tela <a className="font-semibold text-petroleo underline" href="#/valores">Meus valores</a>.
        </p>
      </Secao>

      <Secao titulo="Nota de compatibilidade (estimativa)" id="m-compat">
        <p>
          É um número de 0 a 100 que resume o quanto os dados que encontrei combinam com os critérios acima. Cada candidato recebe uma nota por
          critério, derivada apenas dos pontos listados na ficha. Onde não achei evidência, o critério fica marcado como <strong>sem dados</strong> e não
          entra na média. Faixas: 0–39 baixa, 40–69 média, 70–100 alta. <strong>É uma estimativa baseada nos dados encontrados, não uma medida objetiva</strong>;
          candidatos com pouca informação pública podem ter nota distorcida.
        </p>
      </Secao>

      <Secao titulo="Régua de documentação" id="m-doc">
        <ul className="ml-5 list-disc space-y-1">
          <li><strong>0–29:</strong> pouca fonte, única ou partidária.</li>
          <li><strong>30–59:</strong> poucas fontes ou enviesadas.</li>
          <li><strong>60–79:</strong> ao menos 2 fontes jornalísticas independentes ou documento oficial.</li>
          <li><strong>80–100:</strong> várias fontes independentes e/ou documento primário.</li>
        </ul>
      </Secao>

      <Secao titulo="Como o texto dos seus valores vira pesos" id="m-texto">
        <p>
          Não é IA. Um dicionário de palavras-chave, guardado no próprio site, procura termos (sem considerar acentos ou maiúsculas): por exemplo
          escola, professor e ensino acionam <em>educação</em>; negros, mulheres, LGBT, deficiência e racismo acionam <em>minorias</em>; periferia, favela e
          projeto social acionam <em>periferia</em>; discreto e sem holofote acionam <em>baixa exposição</em>.
        </p>
        <p className="mt-2">
          O texto é dividido em trechos (por pontuação e por conectores como “e”, “mas”, “além de”) e cada trecho é classificado; um trecho pode acionar
          mais de um critério. Mais menções e palavras como “prioridade” ou “principalmente” aumentam o peso; “não me importo” diminui. Critérios não
          mencionados têm peso 0 e ficam fora do cálculo; os demais pesos são reescalados para somar 100. Você vê e corrige os pesos antes de aplicar.
        </p>
        <p className="mt-2">
          A nota personalizada é a média ponderada das notas por critério (só os ativos e com dados). Ela é uma <strong>estimativa</strong>. Se você falar de
          temas fora dos quatro critérios (saúde, segurança, economia…), o site avisa que não os avalia.
        </p>
      </Secao>

      <Secao titulo="Regras editoriais" id="m-regras">
        <ul className="ml-5 list-disc space-y-1">
          <li>Toda afirmação tem fonte e data de acesso; distinguimos fala, denúncia, investigação, processo e condenação.</li>
          <li>Quando há defesa do candidato, ela é incluída; quando não a encontrei, digo isso.</li>
          <li>Fotos, nomes de urna, números e partidos conferem com os dados abertos do TSE.</li>
          <li>Só entram informações de plataformas públicas; nada de dados pessoais sensíveis.</li>
          <li>Achou um erro? Use “Reportar erro” na ficha.</li>
        </ul>
      </Secao>

      <Secao titulo="Limitações" id="m-limites">
        <p>
          Só há 12 candidatos pesquisados, escolhidos pelo autor; a ausência de alguém não significa nada. A pesquisa cobre notícias e fontes oficiais
          disponíveis na data indicada e pode conter lacunas. Confira sempre as fontes.
        </p>
      </Secao>
    </div>
  )
}
