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

export const tseSchema = z.array(
  z.object({
    id: z.string(),
    cargo: z.enum(['federal', 'estadual']),
    numero: z.string(),
    nomeUrna: z.string(),
    partido: z.string(),
  }),
)

export const partidosSchema = z.object({
  fonte: z.object({ titulo: z.string(), url: z.string().url(), escala: z.string() }),
  partidos: z.record(z.string(), z.object({ lr: z.number().min(0).max(10).nullable(), nota: z.string().optional() })),
})

export type Candidato = z.infer<typeof candidatoSchema>
export type Fonte = z.infer<typeof fonteSchema>
