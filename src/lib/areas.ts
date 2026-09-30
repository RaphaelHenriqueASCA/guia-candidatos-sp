import type { Area } from './schema'

export type DefArea = {
  id: Area
  nome: string
  /** Descrição curta do que a régua mede. */
  resumo: string
  /** Frases de exemplo: como falam quem está em cada ponto da régua. */
  exemplos: { progE: string; progM: string; consM: string; consE: string }
  /** Palavras que indicam que a pessoa falou desta área (texto sem acento, minúsculo). */
  palavras: string
  /** Expressões com lado definido. Prefixo "~" = pode ser invertida por "contra/fim de" logo antes. */
  prog: string[]
  cons: string[]
}

export const DEFS: DefArea[] = [
  {
    id: 'educacao',
    nome: 'Educação',
    resumo: 'Papel da escola, dos professores e do ensino público.',
    exemplos: {
      progE: 'Educação pública, gratuita e laica é a base de tudo: mais verba, salário digno para professores, educação sexual e combate ao racismo nas escolas.',
      progM: 'Quero investimento forte na escola pública e respeito aos professores, com autonomia para ensinar.',
      consM: 'A escola deve priorizar disciplina, português e matemática, com mais participação dos pais no que os filhos aprendem.',
      consE: 'Chega de doutrinação: defendo Escola sem Partido, escolas cívico-militares e o direito de educar em casa.',
    },
    palavras: 'educacao|escola\\w*|professor\\w*|ensino|universidade\\w*|alun[oa]s?|creche\\w*|docente\\w*',
    prog: [
      'educacao publica', 'escola publica', 'ensino publico', 'universidade publica', 'educacao gratuita',
      'valoriza\\w+ (d\\w+ )?professor\\w*', 'respeito aos professores', 'autonomia (docente|dos professores)',
      '~educacao sexual', 'educacao integral', 'escola inclusiva', 'ensino laico', 'escola laica', 'merenda escolar',
      'mais verba (para|na) educacao', 'salario (digno )?(d\\w+ )?professor\\w*',
    ],
    cons: [
      '~escola sem partido', 'civico militar\\w*', 'escolas? militar\\w*', 'militariza\\w+ (d\\w+ )?escola\\w*',
      'educacao domiciliar', 'homeschooling', 'doutrinacao', 'voucher\\w*', '~ensino religioso',
      'privatiza\\w+ (d\\w+ )?(escola\\w*|ensino|educacao)', 'disciplina (na|nas) escola\\w*',
    ],
  },
  {
    id: 'familia',
    nome: 'Família e costumes',
    resumo: 'Modelos de família, gênero, aborto e educação moral dos filhos.',
    exemplos: {
      progE: 'Cada pessoa define a família que quer: defendo casamento igualitário, educação sexual nas escolas e o direito de decidir sobre o próprio corpo.',
      progM: 'As famílias são diversas e o Estado deve protegê-las todas, com igualdade de gênero e planejamento familiar.',
      consM: 'A família é a base da sociedade e os pais devem ter a palavra final sobre a educação moral dos filhos.',
      consE: 'Defendo a família tradicional, entre homem e mulher, a defesa da vida desde a concepção e sou contra a ideologia de gênero.',
    },
    palavras: 'familia\\w*|casamento\\w*|aborto\\w*|filhos?|crianca\\w*|genero|costumes|maternidade|paternidade',
    prog: [
      'casamento (igualitario|gay|homoafetivo)', 'familias? (diversas?|homoafetivas?|plurais)', 'aborto legal',
      'legaliza\\w+ (d\\w+ )?aborto', 'descriminaliza\\w+ (d\\w+ )?aborto', 'direito (ao aborto|de decidir sobre o proprio corpo)',
      'igualdade de genero', 'planejamento familiar',
    ],
    cons: [
      'familia tradicional', 'valores (da )?familia', 'defesa da familia', 'ideologia de genero', 'pro vida',
      'defesa da vida', 'contra o aborto', 'casamento entre (um )?homem e (uma )?mulher', 'direito dos pais',
      'pais (tem|devem ter) (a )?(palavra|ultima palavra)',
    ],
  },
  {
    id: 'seguranca',
    nome: 'Segurança pública',
    resumo: 'Polícia, penas, armas e prevenção da violência.',
    exemplos: {
      progE: 'Mais polícia não resolve: precisamos de prevenção, fim da violência policial, desencarceramento e controle rígido de armas.',
      progM: 'Quero polícia comunitária, investimento em prevenção e punição dentro dos direitos humanos.',
      consM: 'Quero mais policiais nas ruas, penas mais duras para crimes violentos e apoio à polícia.',
      consE: 'Bandido tem que pagar: defendo redução da maioridade penal, fim das saidinhas e o direito de o cidadão de bem ter arma.',
    },
    palavras: 'seguranca|policia\\w*|crimes?|criminos\\w*|violencia|prisao|prisoes|cadeias?|armas?|penas?|bandid\\w*|maioridade penal',
    prog: [
      'policia comunitaria', 'desencarceramento', 'prevencao (da|a) violencia', 'controle de armas', 'desarmamento',
      'violencia policial', 'direitos humanos', 'desmilitariza\\w+', 'audiencia de custodia', 'penas? alternativas?',
      'descriminaliza\\w+ (d\\w+ )?(drogas|maconha)',
    ],
    cons: [
      'mao dura', 'bandido (bom|tem que)', '~reducao da maioridade( penal)?', '~pena de morte', 'prisao perpetua',
      'excludente de ilicitude', 'apoio (a|as) (policia|policiais|forcas)', 'tolerancia zero', 'endurec\\w+',
      'penas? (mais )?(duras?|maiores|rigorosas?)', 'direito (a|de ter) (porte de )?arma', 'armamento',
      'acesso (a|as) armas', 'cidadao de bem armado', 'saidinhas?', 'mais (policiais|policiamento)',
    ],
  },
  {
    id: 'economia',
    nome: 'Economia e papel do Estado',
    resumo: 'Impostos, privatizações, direitos trabalhistas e gasto público.',
    exemplos: {
      progE: 'O Estado precisa reduzir a desigualdade: taxar grandes fortunas, fortalecer serviços públicos e proteger direitos trabalhistas.',
      progM: 'Quero mercado com regras fortes, salário mínimo valorizado e investimento público em áreas essenciais.',
      consM: 'Quero menos burocracia e menos impostos, com o Estado focado no essencial e aberto a parcerias privadas.',
      consE: 'Estado mínimo: privatizar o que for possível, cortar impostos e gastos e liberar a economia.',
    },
    palavras: 'economia|impostos?|tribut\\w*|privatiza\\w*|salarios?|empregos?|mercado|gastos? publicos?|trabalhist\\w*|empresa\\w*|renda|desigualdade\\w*',
    prog: [
      'taxa\\w+ (d\\w+ )?(grandes )?fortunas', 'imposto (sobre|para) (os )?(ricos|super ?ricos)', 'estado forte',
      'servicos? publicos?', 'gasto social', 'direitos trabalhistas', 'salario minimo', 'renda basica', 'reforma agraria',
      'combat\\w+ (a |as )?desigualdade\\w*', 'reduzir (a )?desigualdade\\w*', 'estatiza\\w+', 'programas? sociais?',
      'bolsa familia', 'justica fiscal',
    ],
    cons: [
      '~privatiza\\w+', 'estado minimo', 'menos (impostos?|burocracia|estado)', 'livre mercado', 'reforma trabalhista',
      'liberdade economica', 'cortar (gastos|impostos)', 'reduzir (os )?impostos', 'reducao de impostos',
      'desburocratiza\\w+', 'austeridade', 'equilibrio fiscal', 'teto de gastos', 'livre iniciativa',
    ],
  },
  {
    id: 'saude',
    nome: 'Saúde',
    resumo: 'SUS, planos de saúde, gestão privada e vacinas.',
    exemplos: {
      progE: 'Saúde é direito universal: defendo um SUS forte e 100% público, sem privatização da gestão.',
      progM: 'Quero mais investimento no SUS e reforço da atenção básica e das vacinas.',
      consM: 'Quero o SUS funcionando com parcerias com hospitais privados e organizações sociais para reduzir filas.',
      consE: 'O Estado gasta mal: defendo gestão privada da saúde, planos mais acessíveis e liberdade individual sobre vacinas.',
    },
    palavras: 'saude|sus|hospital\\w*|hospitais|planos? de saude|vacina\\w*|medic\\w*|ubs',
    prog: [
      'sus (forte|universal|100)', 'fortalec\\w+ (o )?sus', 'saude publica', 'saude (e|como) (um )?direito',
      'atencao basica', 'defend\\w+ (o )?sus', 'mais investimento (no|na) sus', 'saude universal',
      'vacina\\w* (obrigatori\\w*|para todos)',
    ],
    cons: [
      'privatiza\\w+ (d\\w+ )?(saude|hospitais?|sus)', 'gestao privada', 'organizacoes? sociais?', 'parcerias? (publico )?privad\\w+',
      'planos? (de saude )?acessiveis', 'liberdade (vacinal|individual)', 'vacina nao (deve ser )?obrigatoria',
      'contra (a )?vacina\\w* obrigatori\\w*',
    ],
  },
  {
    id: 'ambiente',
    nome: 'Meio ambiente',
    resumo: 'Preservação, clima, agronegócio e licenciamento.',
    exemplos: {
      progE: 'A emergência climática exige agir já: zerar o desmatamento, proteger a Amazônia e abandonar os combustíveis fósseis.',
      progM: 'Desenvolvimento só faz sentido se proteger o meio ambiente, com licenciamento rigoroso e energia limpa.',
      consM: 'É preciso equilibrar preservação e produção, com licenciamento mais ágil e segurança para quem produz.',
      consE: 'A legislação ambiental trava o país: defendo liberar mineração e produção agrícola e menos fiscalização.',
    },
    palavras: 'meio ambiente|ambient\\w*|clima\\w*|desmatamento|amazonia|florestas?|energia\\w*|agro\\w*|mineracao|preservacao|sustentab\\w*|poluicao',
    prog: [
      'proteger (a )?(amazonia|floresta\\w*|meio ambiente)', 'preserva\\w+ (d\\w+ )?(amazonia|florestas?|meio ambiente|natureza)',
      'zerar (o )?desmatamento', 'combat\\w+ (o )?desmatamento', 'emergencia climatica', 'crise climatica',
      'transicao energetica', 'energia (limpa|renovavel|solar|eolica)', 'agroecologia', 'acordo de paris',
      'licenciamento (ambiental )?rigoroso',
    ],
    cons: [
      'flexibiliza\\w+ (d\\w+ )?(licenciamento|legislacao ambiental|codigo florestal)', 'licenciamento (mais )?agil',
      'liberar (a )?(mineracao|agrotoxicos?|garimpo)', 'desenvolvimento (antes|acima)', 'ambientalismo radical',
      'industria do ambientalismo', 'menos fiscaliza\\w+ ambiental', 'explora\\w+ (de )?(petroleo|mineral)',
    ],
  },
  {
    id: 'transporte',
    nome: 'Transporte e mobilidade',
    resumo: 'Transporte público, tarifa, ciclovias e uso do carro.',
    exemplos: {
      progE: 'A cidade é das pessoas: tarifa zero, prioridade total ao transporte público, ciclovias e menos espaço para carros.',
      progM: 'Quero mais metrô, ônibus e ciclovias, com tarifa justa e integração.',
      consM: 'Quero equilíbrio entre ônibus e carros, com mais vias e concessões para melhorar o serviço.',
      consE: 'Motorista não é inimigo: defendo mais vias e estacionamento, fim de faixas exclusivas que travam o trânsito e privatização do transporte.',
    },
    palavras: 'transportes?|onibus|metro|metroviari\\w*|trens?|tarifa\\w*|ciclovia\\w*|bicicleta\\w*|carros?|transito|mobilidade|motorista\\w*|rodovia\\w*|ciclofaixa\\w*',
    prog: [
      'transporte (publico|coletivo)', 'tarifa zero', 'passe livre', '~ciclovias?', '~ciclofaixas?', 'mobilidade ativa',
      'priorizar (o )?(transporte|onibus|metro)', 'faixas? exclusivas? (de|para|do) onibus', 'mais (metro|trens?|onibus)',
      'corredores? de onibus', 'menos carros', 'pedestres?',
    ],
    cons: [
      'privatiza\\w+ (d\\w+ )?(transporte|metro|onibus|trens?|cptm)', 'concess\\w+ (d\\w+ )?(transporte|metro|rodovias?|linhas?)',
      'mais (vias|estacionamentos?|rodovias|viadutos)', 'motorista nao e inimigo', 'aumentar (a )?velocidade',
      'velocidade (maior|mais alta)',
    ],
  },
  {
    id: 'minorias',
    nome: 'Direitos das minorias',
    resumo: 'Raça, gênero, LGBT, deficiência, povos indígenas e cotas.',
    exemplos: {
      progE: 'Defendo cotas, punição rigorosa a racismo e homofobia, demarcação de terras indígenas e políticas afirmativas para corrigir desigualdades históricas.',
      progM: 'Quero combate ao racismo e à discriminação, com acessibilidade e oportunidades iguais.',
      consM: 'Todos são iguais perante a lei: sou contra tratamentos diferenciados por grupo e favorável à meritocracia.',
      consE: 'Chega de vitimismo: sou contra cotas e contra pautas identitárias; a lei vale igual para todo mundo.',
    },
    palavras: 'minoria\\w*|negr[oa]s?|pret[oa]s?|mulher\\w*|lgbt\\w*|gays?|lesbica\\w*|trans|transgener\\w*|transexua\\w*|indigena\\w*|quilombola\\w*|deficien\\w*|pcd|racismo|racista\\w*|homofobia|transfobia|cotas?|discrimina\\w*|identitari\\w*|vitimismo|imigrante\\w*|refugiad\\w*',
    prog: [
      '~cotas?', 'politicas? afirmativas?', 'combat\\w+ (o )?(racismo|machismo|preconceito|discriminacao|homofobia|transfobia)',
      'igualdade racial', 'direitos (lgbt\\w*|das mulheres|dos negros|indigenas|das pessoas com deficiencia)',
      '~demarca\\w+ (de )?terras? indigenas?', 'acessibilidade', 'criminaliza\\w+ (da )?(homofobia|transfobia|misoginia)',
      'reparacao historica',
    ],
    cons: [
      'pautas? identitarias?', 'politicas? identitarias?', 'vitimismo', 'mimimi', 'meritocracia',
      'iguais perante a lei', 'ideologia de genero', '~marco temporal', 'feminismo radical',
    ],
  },
  {
    id: 'religiao',
    nome: 'Religião e Estado',
    resumo: 'Laicidade do Estado, valores religiosos e ensino religioso.',
    exemplos: {
      progE: 'O Estado é laico: nenhuma religião deve influenciar leis nem escolas, e a intolerância religiosa deve ser punida.',
      progM: 'Respeito todas as religiões, mas a fé não deve guiar as políticas públicas.',
      consM: 'A fé é parte importante da sociedade e os valores religiosos devem ser respeitados no debate público.',
      consE: 'Este é um país cristão: os valores cristãos devem orientar as leis, com ensino religioso nas escolas e Deus acima de tudo.',
    },
    palavras: 'religia\\w*|igrejas?|deus|fe|evangelic\\w*|catolic\\w*|cristao|cristaos|crista\\w*|laic\\w*|pastor\\w*|umbanda|candomble|biblia',
    prog: [
      'estado (e )?laico', 'laicidade', 'separacao (entre )?(a )?(igreja e (o )?estado|religiao e (o )?estado)',
      'combat\\w+ (a )?intolerancia religiosa', 'punir (a )?intolerancia religiosa', 'intolerancia religiosa deve ser punida',
      'respeito a todas as religioes',
      'religioes de matriz africana',
    ],
    cons: [
      'valores cristaos', 'pais cristao', 'deus acima de tudo', 'bancada evangelica', 'ensino religioso',
      'simbolos religiosos', 'principios cristaos', 'fe crista', 'lei de deus', 'em nome de deus',
    ],
  },
]

export const DEF: Record<Area, DefArea> = Object.fromEntries(DEFS.map((d) => [d.id, d])) as Record<Area, DefArea>

/** Frase de exemplo para a posição atual (-100 progressista … +100 conservador). */
export function exemploPara(area: Area, pos: number): { rotulo: string; frase: string } {
  const e = DEF[area].exemplos
  if (pos <= -60) return { rotulo: 'Progressista (extremo)', frase: e.progE }
  if (pos <= -20) return { rotulo: 'Progressista (moderado)', frase: e.progM }
  if (pos < 20) return { rotulo: 'Neutro', frase: 'Sem posição firme nesta área: nem um lado nem o outro me representa por completo.' }
  if (pos < 60) return { rotulo: 'Conservador (moderado)', frase: e.consM }
  return { rotulo: 'Conservador (extremo)', frase: e.consE }
}

export function rotuloPosicao(pos: number): string {
  if (pos <= -60) return 'Muito progressista'
  if (pos <= -20) return 'Progressista'
  if (pos < 20) return 'Neutro'
  if (pos < 60) return 'Conservador'
  return 'Muito conservador'
}
