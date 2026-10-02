import { z } from 'zod'

export const AREAS = ['educacao', 'familia', 'seguranca', 'economia', 'saude', 'ambiente', 'transporte', 'minorias', 'religiao'] as const
export type Area = (typeof AREAS)[number]

const dataIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data deve ser AAAA-MM-DD')
const nota = z.number().int().min(0).max(100)

export const fonteSchema = z.object({
  titulo: z.string().min(3),
  url: z.string().url().refine((u) => /^https?:\/\//.test(u), 'URL deve ser http(s)'),
  data: dataIso,
})

// -100 = progressista ... 0 = neutro ... +100 = conservador
const posicaoSchema = z.object({
  valor: z.number().int().min(-100).max(100),
  nota: z.string().min(5),
})

export const TIPOS_OCORRENCIA = [
  'condenacao_criminal',
  'condenacao_administrativa', // inclui improbidade, cassação, rejeição de contas
  'condenacao_civel',
  'sancao_etica', // advertência/suspensão/expulsão em conselho de ética ou partido
  'acao_em_curso', // réu em ação penal ou de improbidade
  'investigacao', // inquérito, apuração do MP, PF, CGU etc.
  'citacao', // citado em delação, planilha, reportagem ou publicação, sem investigação formal conhecida
  'representacao', // pedido de investigação ou representação apresentado por terceiros
] as const
export type TipoOcorrencia = (typeof TIPOS_OCORRENCIA)[number]

// definitiva = transitada em julgado/sanção final; nao_definitiva = cabe recurso; em_curso = sem desfecho conhecido;
// arquivada_ou_revertida = arquivada, absolvido ou decisão revertida (aparece na ficha, mas pesa zero)
export const SITUACOES = ['definitiva', 'nao_definitiva', 'em_curso', 'arquivada_ou_revertida'] as const
export type Situacao = (typeof SITUACOES)[number]

export const ocorrenciaSchema = z.object({
  tipo: z.enum(TIPOS_OCORRENCIA),
  situacao: z.enum(SITUACOES),
  ano: z.number().int().min(1950).max(2026),
  descricao: z.string().min(15),
  /** URL de uma das fontes da ficha */
  fonte: z.string().url(),
})
export type Ocorrencia = z.infer<typeof ocorrenciaSchema>

export const candidatoSchema = z
  .object({
    id: z.string().regex(/^(federal|estadual)-\d{4,5}$/),
    cargo: z.enum(['federal', 'estadual']),
    nomeUrna: z.string().min(2),
    partido: z.string().min(2),
    numero: z.string().regex(/^\d{4,5}$/),
    doc: nota,
    // posição própria (da curadoria) em cada área; onde falta, vale a posição estimada pelo partido
    posicoes: z.partialRecord(z.enum(AREAS), posicaoSchema),
    pontosCompativeis: z.array(z.string().min(5)),
    pontosConflito: z.array(z.string().min(5)),
    fontes: z.array(fonteSchema),
    /** processos e investigações encontrados na pesquisa (base do índice de controvérsias) */
    ocorrencias: z.array(ocorrenciaSchema).default([]),
    origem: z.string().min(3),
    pesquisadoEm: dataIso,
  })
  .refine((c) => c.id === `${c.cargo}-${c.numero}`, { message: 'id deve ser {cargo}-{numero}' })
  .refine((c) => (c.cargo === 'federal' ? c.numero.length === 4 : c.numero.length === 5), {
    message: 'federal tem 4 dígitos; estadual tem 5',
  })
  .refine(
    (c) => c.pontosCompativeis.length + c.pontosConflito.length + Object.keys(c.posicoes).length === 0 || c.fontes.length > 0,
    { message: 'toda afirmação e posição precisa de ao menos uma fonte com data' },
  )

export const candidatosSchema = z.array(candidatoSchema).superRefine((arr, ctx) => {
  const vistos = new Set<string>()
  arr.forEach((c, i) => {
    if (vistos.has(c.id)) ctx.addIssue({ code: 'custom', message: `id duplicado: ${c.id}`, path: [i] })
    vistos.add(c.id)
  })
})

export const JULGAMENTOS = ['deferido', 'deferido_recurso', 'indeferido', 'indeferido_recurso', 'renuncia'] as const
export type Julgamento = (typeof JULGAMENTOS)[number]
export const FICHA_LIMPA = ['barrado', 'em_recurso', 'citado'] as const
export type FichaLimpa = (typeof FICHA_LIMPA)[number]

export const tseSchema = z.array(
  z.object({
    id: z.string(),
    cargo: z.enum(['federal', 'estadual']),
    numero: z.string(),
    nomeUrna: z.string(),
    partido: z.string(),
    /** julgamento do registro de candidatura no TSE (quando já publicado) */
    jg: z.enum(JULGAMENTOS).optional(),
    /** Lei da Ficha Limpa (inelegibilidade LC 64/90): barrado (registro indeferido), em recurso ou citado */
    fl: z.enum(FICHA_LIMPA).optional(),
  }),
)

export const partidosSchema = z.object({
  fonte: z.object({ titulo: z.string(), url: z.string().url(), escala: z.string() }),
  partidos: z.record(z.string(), z.object({ lr: z.number().min(0).max(10).nullable(), nota: z.string().optional() })),
})

export type Candidato = z.infer<typeof candidatoSchema>
export type Fonte = z.infer<typeof fonteSchema>
