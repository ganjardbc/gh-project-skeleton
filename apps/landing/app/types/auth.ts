export interface RegisterPayload {
  name: string
  email: string
  password: string
  merchant: {
    slug: string
    name: string
  }
}
