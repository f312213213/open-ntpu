import { EToken } from '@/oauth/constants/token'
import { IAuthorizationCode } from '@/oauth/interfaces/auth'
import { IErrorReturn } from '@/oauth/interfaces/api'
import { db } from '@/oauth/lib/firebase'
import { getPayloadFromToken } from '@/oauth/utils/auth'
import type { NextApiRequest, NextApiResponse } from 'next'

interface Data {
  user: any
}

interface IRequestBody extends IAuthorizationCode {
  clientId: string
  clientSecret: string
}

interface IRequest extends NextApiRequest {
  body: IRequestBody
}

const userInfoHandler = async (
  req: IRequest,
  res: NextApiResponse<Data | IErrorReturn>
) => {
  // get token in auth header
  const token = req.headers.authorization ?? ''
  // get projectId, userId in token
  let payload
  try {
    payload = getPayloadFromToken(token)
  } catch (e: any) {
    return res
      .status(400)
      .json({ msg: e.message })
  }

  if (!payload || !payload.iss || payload.as !== EToken.ACCESS) {
    return res
      .status(400)
      .json({ msg: 'Invalid token.' })
  }

  const userTokenSnapshot = await db
    .collection('app')
    .doc(payload.iss)
    .collection('user')
    .doc(payload.userId)
    .get()

  const userToken = userTokenSnapshot.data()

  if (userToken?.accessToken !== token) {
    return res
      .status(400)
      .json({ msg: 'Invalid token.' })
  }

  // get user data
  const userSnapshot = await db.collection('user').doc(payload.userId).get()
  const user = userSnapshot.data()?.user as any

  return res.status(200).json({ ...user })
}

export default userInfoHandler
