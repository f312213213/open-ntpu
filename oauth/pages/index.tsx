import { Button } from '@/oauth/components/Button'
import { Card } from '@/oauth/components/Card'
import { FormEvent, useRef } from 'react'
import { GetServerSideProps } from 'next'
import { db } from '@/oauth/lib/firebase'
import { useRouter } from 'next/router'
import * as Form from '@radix-ui/react-form'

const Home = ({ clientName }: {clientName: string}) => {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const fetchLogin = async (e: FormEvent) => {
    e.preventDefault()
    const clientId = router.query.clientId
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
      const data = await response.json()
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
                <Button className={'bg-white text-black'}>
                  登入
                </Button>
              </Form.Submit>
            </div>
          </Form.Submit>
        </Form.Root>
      </Card>

    </div>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  const { clientId } = query
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
  return {
    props: {
      clientName: projectInfo?.clientName,
    },
  }
}
