import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { FormEvent, useEffect, useRef, useState } from 'react'

import { AlertDialog, AlertDialogContent } from '@/components/AlertDialog'
import Complete from '@/components/icons/Complete'
import * as Form from '@radix-ui/react-form'

export default function Home () {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [requestId, setRequestId] = useState(undefined)
  const fetchLogin = async (e: FormEvent) => {
    setLoading(true)
    e.preventDefault()
    try {
      const response = await fetch('https://docker.ntpu.cc/start-autocomplete', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // @ts-ignore
          schoolId: formRef.current.schoolId.value,
          // @ts-ignore
          password: formRef.current.password.value,
        }),
      })
      const data = await response.json()
      setRequestId(data.requestId)
      console.log(data)
    } catch (e) {
      console.log(e)
    }
  }

  // eslint-disable-next-line no-undef
  let interval: NodeJS.Timer

  const fetchStatus = async () => {
    try {
      const response = await fetch(`https://docker.ntpu.cc/${requestId}/check-status`)
      const data = await response.json()
      if (data.finished) {
        setTimeout(() => {
          setLoading(false)
          setSuccess(false)
          setRequestId(undefined)
        }, 2500)
        setSuccess(true)
        clearInterval(interval)
      }
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (loading && requestId) {
      interval = setInterval(() => {
        fetchStatus()
      }, 1000)
    }
  }, [loading, requestId])
  return (
    <>
      {
        loading && (
          <AlertDialog defaultOpen>
            <AlertDialogContent className={'sm:max-w-[425px] bg-black flex justify-center items-center'}>
              {
                success
                  ? (
                    <div className={'grid gap-4 py-4'}>
                      <Complete />
                    </div>
                    )
                  : (
                    <div className={'grid gap-4 py-4'}>
                      Loading...
                    </div>
                    )
              }
            </AlertDialogContent>
          </AlertDialog>
        )
      }

      <div className={'w-full h-screen flex justify-center items-center bg-[#171717]'}>
        <Card className={'overflow-hidden'}>
          <Form.Root className={'w-[500px] bg-[#171717] p-10 rounded'} ref={formRef} onSubmit={fetchLogin}>
            <h1 className={'text-white font-bold text-center text-2xl my-10'}>
              自動完成課程問卷
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
                <input className={'p-2 my-2 rounded text-black'} type={'text'} required />
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
                <input className={'p-2 my-2 rounded  text-black'} type={'password'} required />
              </Form.Control>
            </Form.Field>

            <Form.Submit asChild>
              <div className={'w-full flex justify-center'}>
                <Form.Submit asChild>
                  <Button className={'bg-white text-black hover:bg-gray-300 transform hover:scale-105 transition'}>
                    開始！
                  </Button>
                </Form.Submit>
              </div>
            </Form.Submit>
          </Form.Root>
        </Card>
      </div>
    </>
  )
}
