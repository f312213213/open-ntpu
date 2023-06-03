require('dotenv').config()
const express = require('express')
const Docker = require('dockerode')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')

const app = express()

const admin = require('firebase-admin')

let db

let fireConfig

const EStatus = {
  PENDING: 0,
  SUCCESS: 1,
  FAILURE: 2,
}

app.use(cors({
  origin: '*',
}))

app.use(express.json())

app.get('/:id/check-status', (req, res) => {
  const containerId = req.params.id
  db.collection('course-form-autocomplete').doc(containerId).get()
    .then(doc => {
      const data = doc.data()
      const finished = data.status === EStatus.SUCCESS

      if (finished) res.set('Cache-control', 'public, max-age=8640000')

      res.status(200).send({
        finished,
      })
    })
    .catch(e => {
      res.status(404).send({
        e: e.msg,
      })
    })
})

app.post('/finish-job', (req, res) => {
  const { containerId, schoolId } = req.body
  console.log(`Request by ${schoolId}'s container ${containerId} finished successfully.`)
  db.collection('course-form-autocomplete').doc(containerId).update({
    status: EStatus.SUCCESS,
  })
  res.status(200).send({
    finished: true,
  })
})

app.post('/start-autocomplete', (req, res) => {
  try {
    const containerId = uuidv4()
    const {
      schoolId,
      password,
    } = req.body
    console.log(`Start handling request by: ${schoolId}`)
    const docker = new Docker()

    const envArray = [
      `schoolId=${schoolId}`,
      `password=${password}`,
      `containerId=${containerId}`,
      `HOST_DOMAIN=${process.env.HOST_DOMAIN}`,
    ]

    const containerOptions = {
      Image: 'course-form-autocomplete',
      Env: envArray,
    }

    docker.createContainer(containerOptions)
      .then(container => {
        return container.start()
      })
      .then(() => {
        console.log(`Request by ${schoolId}'s container ${containerId} start successfully.`)
        db.collection('course-form-autocomplete').doc(containerId).set({
          status: EStatus.PENDING,
          schoolId,
        })
          .then(() => {
            res.status(200).send({
              requestId: containerId,
            })
          })
      })
      .catch(err => {
        console.error('Error starting container:', err)
      })

    // docker.createContainer(containerOptions)
    //   .then(container => container.start().then(() => container.wait()))
    //   .then(data => {
    //     const exitCode = data.StatusCode
    //     if (exitCode === 0) {
    //       res.status(200).send('Container exited successfully.')
    //       console.log(`Request by ${schoolId}'s container exited successfully.`)
    //     } else {
    //       res.status(400).send(`Container exited with non-zero status code: ${exitCode}`)
    //       console.log(`Request by ${schoolId}'s container exited with non-zero status code: ${exitCode}`)
    //     }
    //   })
    //   .catch(err => {
    //     res.status(500).send('Error starting container')
    //     console.error('Error starting container:', err)
    //   })
  } catch (e) {
    console.log(e)
  }
})

app.listen(3000, () => {
  fireConfig = {
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
  db = admin.firestore()
  console.log('Server listening on port 3000')
})
