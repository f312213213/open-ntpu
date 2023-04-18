import { EToken } from '@/constants/token'
import { IAuthorizationCode, IUserDataInFirestore } from '@/interfaces/auth'
import { IErrorReturn } from '@/interfaces/api'
import { db } from '@/lib/firebase'
import { generateCommonToken, getPayloadFromToken } from '@/utils/auth'
import type { NextApiRequest, NextApiResponse } from 'next'

interface Data extends IUserDataInFirestore{
}

interface IRequestBody extends IAuthorizationCode {
  clientId: string
  clientSecret: string
}

interface IRequest extends NextApiRequest {
  body: IRequestBody
}
const DAY = 86400

const verifyHandler = async (
  req: IRequest,
  res: NextApiResponse<Data | IErrorReturn>
) => {
  const {
    authorizationCode,
    clientId,
    clientSecret,
  } = req.body
  // verify clientSecret match clientId
  const projectInfoSnapshot = await db.collection('app').doc(clientId).get()

  if (!projectInfoSnapshot.exists) {
    return res
      .status(400)
      .json({ msg: 'project not exist.' })
  }

  const projectInfo = projectInfoSnapshot.data()

  if (projectInfo?.clientSecret !== clientSecret) {
    return res
      .status(400)
      .json({ msg: 'Invalid client secret.' })
  }

  // get user id from authorizationCode
  let payload
  try {
    payload = getPayloadFromToken(
      authorizationCode
    )
  } catch (e: any) {
    return res
      .status(400)
      .json({ msg: e.message })
  }

  if (!payload) {
    return res
      .status(400)
      .json({ msg: 'Invalid authorizationCode.' })
  }

  // update user data(under project) with token
  const accessToken = generateCommonToken(
    payload.userId,
    projectInfo?.clientName,
    projectInfo?.clientId,
    3,
    EToken.ACCESS
  )
  const refreshToken = generateCommonToken(
    payload.userId,
    projectInfo?.clientName,
    projectInfo?.clientId,
    30,
    EToken.REFRESH
  )

  await db.collection('app').doc(clientId).collection('user').doc(payload.userId).set({
    accessToken,
    refreshToken,
  })

  // check user have granted the app
  return res
    .status(200)
    .json({
      accessToken,
      refreshToken,
    })
}

export default verifyHandler
