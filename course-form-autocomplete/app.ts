const express = require('express')
const Docker = require('dockerode')
const cors = require('cors')

const app = express()

app.use(cors({
  origin: '*',
}))

app.use(express.json())

app.post('/start-autocomplete', (req, res) => {
  try {
    const {
      schoolId,
      password,
    } = req.body
    console.log(`Start handling request by: ${schoolId}`)
    const docker = new Docker()

    const containerOptions = {
      Image: 'course-form-autocomplete',
      Env: [`schoolId=${schoolId}`, `password=${password}`],
    }

    docker.createContainer(containerOptions)
      .then(container => container.start().then(() => container.wait()))
      .then(data => {
        const exitCode = data.StatusCode
        if (exitCode === 0) {
          res.status(200).send('Container exited successfully.')
          console.log(`Request by ${schoolId}'s container exited successfully.`)
        } else {
          res.status(400).send(`Container exited with non-zero status code: ${exitCode}`)
          console.log(`Request by ${schoolId}'s container exited with non-zero status code: ${exitCode}`)
        }
      })
      .catch(err => {
        res.status(500).send('Error starting container')
        console.error('Error starting container:', err)
      })
  } catch (e) {
    console.log(e)
  }
})

app.listen(3000, () => {
  console.log('Server listening on port 3000')
})
