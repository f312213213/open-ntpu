import { EToken } from '@/constants/token'
import { IAuthorizationCode, IUserDataInFirestore } from '@/interfaces/auth'
import { IErrorReturn } from '@/interfaces/api'
import { generateCommonToken } from '@/utils/auth'
import admin, { db } from '@/lib/firebase'
import fetch from 'node-fetch'
import type { NextApiRequest, NextApiResponse } from 'next'

interface Data extends IUserDataInFirestore {
  redirectUrl?: string
}

interface IRequestBody extends NextApiRequest {
  body: {
    username: string
    password: string
    clientId: string
  }
}

const loginRequestHandler = async (
  req: IRequestBody,
  res: NextApiResponse<Data | IAuthorizationCode | IErrorReturn>
) => {
  const {
    username,
    password,
    clientId,
  } = req.body
  const searchParams = new URLSearchParams()

  searchParams.append('stud_num', username)
  searchParams.append('passwd', password)
  searchParams.append('x', '109')
  searchParams.append('y', '15')
  const response = await fetch('https://cof.ntpu.edu.tw/pls/pm/stud_system.login', {
    method: 'post',
    body: searchParams,
  })
  const status = String(response.status)

  if (status.includes('5')) {
    return res
      .status(503)
  }

  const responseText = await response.text()

  // 學校系統如果有回傳 window.open 相關字樣則為登入成功 & firebase lib init 完成
  if (responseText.indexOf('window.open') !== -1 && admin.app.length) {
    try {
      const projectInfoSnapshot = await db.collection('app').doc(clientId).get()
      if (!projectInfoSnapshot.exists) {
        return res
          .status(400)
          .json({ msg: 'project not exist.' })
      }

      const projectInfo = projectInfoSnapshot.data()

      const authorizationCode = generateCommonToken(
        username,
        projectInfo?.clientName,
        projectInfo?.clientId,
        0.01,
        EToken.AUTH
      )
      const redirectUrl = projectInfo?.redirectUrl

      return res
        .status(200)
        .json({
          authorizationCode,
          redirectUrl,
        })
    } catch (error: any) {
      return res
        .status(500)
    }
  }

  return res
    .status(403)
    .json({ msg: '錯誤的帳號密碼' })
}

export default loginRequestHandler
