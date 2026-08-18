import { z } from 'zod'

export const brandSchema = z.object({
  name: z.string().trim().min(1, 'Ingresá el nombre de la marca.').max(80, 'La marca no puede superar los 80 caracteres.'),
})

export type BrandInput = z.infer<typeof brandSchema>
