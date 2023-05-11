import { EToken } from '@/oauth/constants/token'
import { JwtPayload, sign, verify } from 'jsonwebtoken'
import * as process from 'process'

const privateKey = process.env.ADMIN_PRIVATE_KEY as string

export const parseCookie = (str: string) => str
  .split(';')
  .map(v => v.split('='))
  .reduce((acc: {[key: string]: string}, v) => {
    acc[decodeURIComponent((v[0] || '').trim())] = decodeURIComponent((v[1] || '').trim())
    return acc
  }, {})

export const getCookie = (name: string) => {
  if (typeof window === 'undefined') return undefined
  const cookies = parseCookie(document.cookie)
  return cookies[name]
}

export const setCookie = (name: string, value: string | number, days: number) => {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

export const deleteCookie = (name: string) => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

export const getJwtFromAuthorizationHeader = (authorizationCode: string) => {
  if (!authorizationCode) throw Error('Invalid token.')
  const jwt = authorizationCode.split(' ')[1]
  if (!jwt) throw Error('Invalid token.')
  return jwt
}

interface IPayload extends JwtPayload {
  userId: string,
  as: EToken
}

export const getPayloadFromToken = (token: string) => {
  return verify(token, privateKey, {
    clockTimestamp: Date.now(),
  }) as IPayload
}

export const generateCommonToken = (userId: string, projectName = 'open-ntpu', projectId = 'open-ntpu', day: number, type: EToken) => {
  return sign(
    {
      userId,
      iss: projectId,
      aud: projectName,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * day,
      as: type,
    },
    process.env.ADMIN_PRIVATE_KEY ?? ''
  )
}
