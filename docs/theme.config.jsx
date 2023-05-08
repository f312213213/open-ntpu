import { useRouter } from 'next/router'

export default {
  logo: <span>Open NTPU Documentation</span>,
  project: {
    link: 'https://github.com/f312213213/ntpu',
  },
  navigation: true,
  footer: {
    text: <span>
      {new Date().getFullYear()} © <a href={'https://ntpu.xyz'} target={'_blank'} rel={'noreferrer'}>Open NTPU</a>
    </span>,
  },
  docsRepositoryBase: 'https://github.com/f312213213/ntpu/blob/main/docs/',
  gitTimestamp: ({ timestamp }) => {
    return (
        <>
          Last updated on{' '}
          {timestamp.toDateString()}
        </>
    )
  },
  useNextSeoProps: () => {
    const { asPath } = useRouter()
    if (asPath !== '/') {
      return {
        titleTemplate: '%s – Open NTPU',
      }
    }
  },
}
