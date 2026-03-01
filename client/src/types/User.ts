export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface UserResponse extends User {
  sub: string
  aud: string
  iss: string
  role: string
  iat: number
  nbf: number
  exp: number
}