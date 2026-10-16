export type Role = 'admin' | 'secretaria' | 'lider'

export type Profile = {
  name: string
  role: Role | null
}
