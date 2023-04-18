export interface IAuthorizationCode {
  authorizationCode: string
}

export interface IUserDataInFirestore {
  accessToken: string
  refreshToken: string
}
