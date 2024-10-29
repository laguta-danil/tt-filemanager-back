import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) { }

  public getCookieWithJwtToken(userId: number) {
    const payload: { userId: number } = { userId }
    const token = this.jwtService.sign(payload)
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRATION_TIME}; Secure; SameSite=None `
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=None`
  }
}
