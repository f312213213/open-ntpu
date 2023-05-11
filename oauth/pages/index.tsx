import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { FormEvent, useRef } from 'react'
import { GetServerSideProps } from 'next'
import { Data as IResponse } from '@/oauth/pages/api/fetch-school-system'
import { db } from '@/oauth/lib/firebase'
import { firestore } from 'firebase-admin'
import { generateCommonToken, getCookie, getPayloadFromToken, setCookie } from '@/oauth/utils/auth'
import { useRouter } from 'next/router'
import * as Form from '@radix-ui/react-form'
import DocumentSnapshot = firestore.DocumentSnapshot;
import { EToken } from '@/oauth/constants/token'

interface IPageProps {
  clientName: string
  isLogin: boolean
  username?: string
}

const Home = ({ clientName, username, isLogin }: IPageProps) => {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const loginStateToken = getCookie('loginStateToken')
  const clientId = router.query.clientId
  const fetchLogin = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/fetch-school-system', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // @ts-ignore
          username: formRef.current.schoolId.value,
          // @ts-ignore
          password: formRef.current.password.value,
          clientId,
        }),
      })
      const data = await response.json() as IResponse
      if (!data.authorizationCode) {
        throw Error()
      }
      setCookie('loginStateToken', data.loginStateToken, 30)
      const url = new URL(data.redirectUrl)
      url.searchParams.append('authorizationCode', data.authorizationCode)
      router.replace(url)
    } catch (e) {
      console.log(e)
    }
  }

  const fetchAuthorization = async () => {
    try {
      const response = await fetch('/api/authorization', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          loginStateToken,
        }),
      })
      const data = await response.json() as IResponse
      if (!data.authorizationCode) {
        throw Error()
      }
      const url = new URL(data.redirectUrl)
      url.searchParams.append('authorizationCode', data.authorizationCode)
      router.replace(url)
    } catch (e) {
      console.log(e)
    }
  }
  return (
    <div className={'w-full h-screen flex justify-center items-center bg-gray-950'}>
      <Card className={'overflow-hidden'}>
        {
          isLogin
            ? (
              <div className={'w-[500px] bg-gray-600 p-10 rounded'}>
                <h1 className={'text-white font-bold text-center text-2xl my-10'}>
                  hi {username}
                </h1>
                <h2 className={'text-white font-bold text-center text-xl my-10'}>
                  您確定要在 {clientName} 內登入嗎？
                </h2>
                <div className={'w-full flex justify-center'}>
                  <Button onClick={fetchAuthorization} className={'bg-white text-black hover:bg-gray-300 transform hover:scale-105 transition'}>
                    確認
                  </Button>
                </div>
              </div>
              )
            : (
              <Form.Root className={'w-[500px] bg-gray-600 p-10 rounded'} ref={formRef} onSubmit={fetchLogin}>
                <h1 className={'text-white font-bold text-center text-2xl my-10'}>
                  您確定要在 {clientName} 內登入嗎？
                </h1>
                <Form.Field className={'grid mb-4'} name={'schoolId'}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <Form.Label className={'font-bold text-white text-2xl'}>學號</Form.Label>
                    <Form.Message className={'text-red-500'} match={'valueMissing'}>
                      請輸入學號
                    </Form.Message>
                    <Form.Message className={'text-red-500'} match={(value) => value.length !== 9}>
                      請檢查學號輸入正確
                    </Form.Message>
                  </div>
                  <Form.Control asChild>
                    <input className={'p-2 my-2 rounded'} type={'text'} required />
                  </Form.Control>
                </Form.Field>

                <Form.Field className={'grid mb-4'} name={'password'}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <Form.Label className={'font-bold text-white text-2xl'}>密碼 <span className={'text-sm'}>同學生資訊系統</span></Form.Label>
                    <Form.Message className={'text-red-500'} match={'valueMissing'}>
                      請輸入密碼
                    </Form.Message>
                  </div>
                  <Form.Control asChild>
                    <input className={'p-2 my-2 rounded'} type={'password'} required />
                  </Form.Control>
                </Form.Field>

                <Form.Submit asChild>
                  <div className={'w-full flex justify-center'}>
                    <Form.Submit asChild>
                      <Button className={'bg-white text-black hover:bg-gray-300 transform hover:scale-105 transition'}>
                        登入
                      </Button>
                    </Form.Submit>
                  </div>
                </Form.Submit>
              </Form.Root>
              )
        }
      </Card>

    </div>
  )
}

export default Home

// @ts-ignore
export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  const { clientId } = query
  const { loginStateToken = '' } = req.cookies
  if (!clientId) {
    return {
      notFound: true,
    }
  }
  const projectInfoSnapshot = await db.collection('app').doc(clientId as string).get()
  if (!projectInfoSnapshot.exists) {
    return {
      notFound: true,
    }
  }

  const projectInfo = projectInfoSnapshot.data()

  let payload

  try {
    payload = getPayloadFromToken(loginStateToken)

    const userSnapshot = await db.collection('user').doc(payload.userId).get()

    if (userSnapshot.exists) {
      // @ts-ignore
      const { user, granted } = userSnapshot.data()

      for (const g of granted) {
        const snapshot = await g.get()
        const pData = (snapshot as DocumentSnapshot).data()

        if (pData?.clientId === clientId) {
          const authorizationCode = generateCommonToken(
            payload.userId,
            pData?.clientName,
            pData?.clientId,
            0.01,
            EToken.AUTH
          )

          const url = new URL(pData.redirectUrl)
          url.searchParams.append('authorizationCode', authorizationCode)

          return {
            redirect: {
              destination: url.toString(),
            },
          }
        }
      }

      // isLogin
      return {
        props: {
          isLogin: true,
          username: user?.username ?? payload.userId,
          clientName: projectInfo?.clientName,
        },
      }
    }
  } catch (e) {
    return {
      props: {
        isLogin: false,
        clientName: projectInfo?.clientName,
      },
    }
  }
}
