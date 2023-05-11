import { EToken } from '@/oauth/constants/token'
import { IAuthorizationCode } from '@/oauth/interfaces/auth'
import { IErrorReturn } from '@/oauth/interfaces/api'
import { generateCommonToken, getPayloadFromToken } from '@/oauth/utils/auth'
import admin, { db } from '@/oauth/lib/firebase'
import fetch from 'node-fetch'
import type { NextApiRequest, NextApiResponse } from 'next'

export interface Data extends IAuthorizationCode {
  redirectUrl: string
}

interface IRequestBody extends NextApiRequest {
  body: {
    loginStateToken: string
    clientId: string
  }
}

const authorizationHandler = async (
  req: IRequestBody,
  res: NextApiResponse<Data | IAuthorizationCode | IErrorReturn>
) => {
  const {
    loginStateToken,
    clientId,
  } = req.body

  try {
    const projectInfoSnapshot = await db.collection('app').doc(clientId).get()
    if (!projectInfoSnapshot.exists) {
      return res
        .status(400)
        .json({ msg: 'project not exist.' })
    }

    const projectInfo = projectInfoSnapshot.data()

    try {
      const payload = getPayloadFromToken(loginStateToken)

      const authorizationCode = generateCommonToken(
        payload.userId,
        projectInfo?.clientName,
        projectInfo?.clientId,
        0.01,
        EToken.AUTH
      )

      return res
        .status(200)
        .json({
          authorizationCode,
          redirectUrl: projectInfo?.redirectUrl,
        })
    } catch (e) {
      return res
        .status(403)
        .json({ msg: '授權錯誤' })
    }
  } catch (e) {
    return res
      .status(403)
      .json({ msg: '授權錯誤' })
  }
}

export default authorizationHandler
