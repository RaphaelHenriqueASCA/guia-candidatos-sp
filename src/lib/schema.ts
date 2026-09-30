import { z } from 'zod'

export const CRITERIOS = ['educacao', 'minorias', 'periferia', 'midia'] as const
export type Criterio = (typeof CRITERIOS)[number]

const nota = z.number().int().min(0).max(100)
const dataIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data deve ser AAAA-MM-DD')

export const fonteSchema = z.object({
  titulo: z.string().min(3),
  url: z.string().url().refine((u) => /^https?:\/\//.test(u), 'URL deve ser http(s)'),
  data: dataIso,
})

export const candidatoSchema = z
  .object({
    id: z.string().regex(/^(federal|estadual)-\d{4,5}$/),
    cargo: z.enum(['federal', 'estadual']),
    nomeUrna: z.string().min(2),
    partido: z.string().min(2),
    numero: z.string().regex(/^\d{4,5}$/),
    compat: nota,
    doc: nota,
    criterios: z.object({ educacao: nota, minorias: nota, periferia: nota, midia: nota }),
    // critérios sem evidência (valor 50 é só preenchimento; ficam fora do cálculo)
    semDados: z.array(z.enum(CRITERIOS)),
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
  .refine((c) => c.pontosCompativeis.length + c.pontosConflito.length === 0 || c.fontes.length > 0, {
    message: 'toda afirmação precisa de ao menos uma fonte com data',
  })

export const candidatosSchema = z.array(candidatoSchema).superRefine((arr, ctx) => {
  const vistos = new Set<string>()
  arr.forEach((c, i) => {
    if (vistos.has(c.id)) ctx.addIssue({ code: 'custom', message: `id duplicado: ${c.id}`, path: [i] })
    vistos.add(c.id)
  })
})

export type Candidato = z.infer<typeof candidatoSchema>
export type Fonte = z.infer<typeof fonteSchema>
