import { GetServerSideProps } from 'next'

export default function Home () {
  return null
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { host } = req.headers
  return {
    props: {},
    redirect: {
      destination: host?.includes('localhost') ? 'https://docs.ntpu.xyz' : 'https://docs.ntpu.cc',
      permanent: true,
    },
  }
}
