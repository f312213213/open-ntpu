import { getAuth } from 'firebase-admin/auth'
import { getJwtFromAuthorizationHeader } from '@/oauth/utils/auth'
import admin from 'firebase-admin'

try {
  const fireConfig = {
    type: process.env.ADMIN_TYPE,
    project_id: process.env.ADMIN_PROJECT_ID,
    private_key_id: process.env.ADMIN_PRIVATE_KEY_ID,
    private_key: process.env.ADMIN_PRIVATE_KEY?.replace(/\\n/gm, '\n'),
    client_email: process.env.ADMIN_CLIENT_EMAIL,
    client_id: process.env.ADMIN_CLIENT_ID,
    auth_uri: process.env.ADMIN_AUTH_URI,
    token_uri: process.env.ADMIN_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.ADMIN_CERT_PROVIDER,
    client_x509_cert_url: process.env.ADMIN_CERT_URL,
  }
  admin.initializeApp({
    // @ts-ignore
    credential: admin.credential.cert(fireConfig),
  })
} catch (error: any) {
  if (!/already exists/u.test(error.message)) {
    console.error('Firebase admin initialization error', error.stack)
  }
}

export const db = admin.firestore()

export const getUserIdFromAuthorizationHeader = async (authorizationCode = '') => {
  const jwt = getJwtFromAuthorizationHeader(authorizationCode)
  // get userId from jwt
  const decodedToken = await getAuth().verifyIdToken(jwt)
  const userId = decodedToken.uid
  if (!userId) throw Error('Invalid token.')
  return userId
}

export const getUserDataFromFirestore = async (schoolId: string) => {
  const userSnapshot = await db.collection('users').doc(schoolId).get()
  return userSnapshot.exists ? userSnapshot.data() : undefined
}

export const createUserDataInFirestore = async (schoolId: string) => {
  // generate
  const userSnapshot = await db.collection('users').doc(schoolId).get()
  return userSnapshot.exists ? userSnapshot.data() : undefined
}

export default admin
