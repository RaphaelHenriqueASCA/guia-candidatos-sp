import { DEFS } from '../lib/areas'
import { DATA_PESQUISA } from '../config'
import { Secao } from '../components/Ui'
import { partidos } from '../lib/posicao'

export function Metodologia() {
  return (
    <div className="max-w-3xl space-y-2">
      <h1 className="text-3xl font-extrabold text-petroleo">Metodologia</h1>
      <p className="text-suave">
        Curadoria pessoal, pesquisada em {DATA_PESQUISA}. Origem dos dados pesquisados: “curadoria inicial”. O site não usa anúncios, cookies de
        rastreamento nem inteligência artificial no seu navegador. Tudo que aparece como número é uma <strong>estimativa</strong> feita com os
        dados que encontrei, não uma medida objetiva.
      </p>

      <Secao titulo="As nove áreas e as réguas" id="m-areas">
        <p>
          Em cada área há uma régua de −100 (<strong>progressista</strong>) a +100 (<strong>conservador</strong>), com 0 no meio. As áreas foram
          escolhidas entre temas recorrentes em debates legislativos e em plataformas de “match” eleitoral, e incluem as que você pediu:
        </p>
        <ul className="ml-5 mt-2 list-disc space-y-1">
          {DEFS.map((d) => (
            <li key={d.id}><strong>{d.nome}:</strong> {d.resumo}</li>
          ))}
        </ul>
        <p className="mt-2 text-suave">
          “Progressista” e “conservador” aqui descrevem o tipo de posição, não um juízo de valor. Cada ponta da régua tem uma frase de exemplo
          escrita para soar como quem pensa daquele jeito.
        </p>
      </Secao>

      <Secao titulo="De onde vem a posição de cada candidato" id="m-posicao">
        <p>A posição segue três níveis, do mais ao menos específico:</p>
        <ol className="ml-5 mt-2 list-decimal space-y-1">
          <li>
            <strong>Curadoria:</strong> posição baseada em falas, projetos e atuação pesquisados, com fontes e data (ficha completa). Só os
            candidatos pesquisados têm isso, e só nas áreas em que encontrei evidência.
          </li>
          <li>
            <strong>Partido:</strong> onde não há curadoria, vale a posição do partido na escala esquerda–direita (0 a 10) segundo a avaliação de
            cientistas políticos: <a className="font-semibold text-petroleo underline" href={partidos.fonte.url} target="_blank" rel="noreferrer noopener">{partidos.fonte.titulo}</a>.
            Ela é convertida para −100…+100 e é <em>igual em todas as áreas</em>. Um candidato pode pensar diferente do partido, e a escala
            esquerda–direita não é exatamente progressista–conservador.
          </li>
          <li>
            <strong>Sem classificação:</strong> partidos novos ou ausentes do estudo (hoje, Missão e Democrata) ficam sem posição, e os seus
            candidatos não recebem afinidade.
          </li>
        </ol>
        <p className="mt-2 text-suave">
          Aproximações: Mobiliza (PMN), PRD (média de PTB e Patriota), PP (Progressistas) e outras siglas renomeadas estão anotadas em
          <code> data/partidos.json</code>. O estudo é de 2022; os partidos mudam.
        </p>
      </Secao>

      <Secao titulo="Como o texto dos seus valores vira posições" id="m-texto">
        <p>
          Não é IA. Um dicionário de expressões, guardado no próprio site, procura termos sem considerar acentos ou maiúsculas. Exemplos:
          “escola sem partido” posiciona <em>Educação</em> no lado conservador; “educação pública e respeito aos professores”, no progressista;
          “tarifa zero”, <em>Transporte</em> no progressista; “redução da maioridade penal”, <em>Segurança</em> no conservador.
        </p>
        <p className="mt-2">
          O texto é dividido em trechos (pontuação e conectores como “e”, “mas”, “além de”) e cada trecho é classificado; um trecho pode tocar mais
          de uma área. “Contra” ou “fim de” antes de certas expressões inverte o lado (“contra cotas” é conservador). Palavras como “muito” e
          “totalmente” reforçam; “um pouco” e “talvez” suavizam. Se você falar de uma área sem dar para saber o lado, ela fica neutra e o site avisa.
          Você pode corrigir qualquer régua à mão.
        </p>
        <p className="mt-2 text-suave">
          Limites: o dicionário é simples e erra ironia, sentidos indiretos e expressões que não conhece. Por isso as réguas ficam visíveis e
          editáveis. Temas fora das nove áreas (cultura, esporte, corrupção…) não são avaliados.
        </p>
      </Secao>

      <Secao titulo="Como a afinidade é calculada" id="m-afinidade">
        <p>
          Para cada área, mede-se a distância entre a sua posição e a do candidato (de 0 a 200 pontos). As áreas que você citou pesam 1; as que
          você não citou contam como <strong>neutras (0) com peso 0,25</strong>. A afinidade é 100 menos a distância média ponderada, em
          porcentagem. Faixas: 0–39 pouca, 40–69 média, 70–100 muita afinidade. Sem nenhuma área citada, não há afinidade.
        </p>
      </Secao>

      <Secao titulo="Índice de controvérsias" id="m-controversias">
        <p>
          É um número de 0 a 100 (mostrado em %) que resume o que foi encontrado sobre <strong>processos e investigações</strong> de cada candidato. Ele não mede
          caráter nem prevê resultado de processo: vale a <strong>presunção de inocência</strong>, e “nenhuma ocorrência encontrada” significa só que a
          pesquisa (limitada às fontes listadas) não achou nada.
        </p>
        <p className="mt-2">Cada ocorrência recebe um peso de 0 a 100 conforme o tipo e a situação:</p>
        <ul className="ml-5 mt-1 list-disc space-y-1">
          <li><strong>Ficha Limpa (dados do TSE):</strong> registro indeferido por inelegibilidade da LC 64/90 = 100; em recurso = 80; citado sem julgamento final = 60.</li>
          <li><strong>Condenação administrativa ou por improbidade:</strong> definitiva = 90; cabe recurso = 70.</li>
          <li><strong>Condenação criminal:</strong> definitiva = 100; cabe recurso = 75.</li>
          <li><strong>Condenação cível:</strong> definitiva = 50; cabe recurso = 40.</li>
          <li><strong>Sanção ético-disciplinar</strong> (conselho de ética, partido): definitiva = 30; cabe recurso = 20.</li>
          <li><strong>Réu em ação em curso</strong> = 45; <strong>investigação aberta</strong> = 25; <strong>citação sem investigação formal</strong> = 10; <strong>representação de terceiros</strong> = 8.</li>
          <li><strong>Arquivada, absolvido ou decisão revertida:</strong> aparece na ficha, mas pesa 0.</li>
        </ul>
        <p className="mt-2">
          Fatos com mais de 10 anos pesam 50% e com mais de 20 anos, 25%. As ocorrências são combinadas de forma que o total nunca passe de 100:
          índice = 100 × (1 − Π(1 − peso/100)). Faixas: 1–19 baixo, 20–49 moderado, 50–79 alto, 80–100 muito alto.
        </p>
        <p className="mt-2 text-suave">
          Limites: para todos os candidatos de SP o site usa a situação do registro no TSE (Ficha Limpa); processos e investigações só foram
          pesquisados nos candidatos com curadoria, com base em fontes públicas e sem acesso a sistemas judiciais. Os pesos são uma escolha do autor.
          Candidatos sem pesquisa aparecem como “não pesquisado”, e não como zero.
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

      <Secao titulo="Regras editoriais e limitações" id="m-regras">
        <ul className="ml-5 list-disc space-y-1">
          <li>Toda afirmação pesquisada tem fonte e data de acesso; distinguimos fala, denúncia, investigação, processo e condenação.</li>
          <li>Quando há defesa do candidato, ela é incluída; quando não a encontrei, isso está dito.</li>
          <li>Nome de urna, número, partido e foto vêm dos dados abertos do TSE (todos os candidatos a deputado federal e estadual de SP).</li>
          <li>Só 54 candidatos foram pesquisados (27 federais e 27 estaduais, em geral entre os mais votados de 2022 que disputam 2026, buscando equilíbrio entre progressistas, centro e conservadores); para os demais só existe a estimativa pelo partido. A ausência de pesquisa não diz nada sobre o candidato.</li>
          <li>Achou um erro? Use “Reportar erro” na ficha.</li>
        </ul>
      </Secao>
    </div>
  )
}
