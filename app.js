'use strict'
// eslint-disable-next-line import/no-unresolved
const express = require('express')
var AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const bodyParser = require('body-parser')
// express
const app = express()
const port = 8000

app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

// aws configs
AWS.config.update({
  region: 'us-east-1',
  // endpoint: 'http://localhost:8000',
})

// constants
var docClient = new AWS.DynamoDB.DocumentClient()
// http codes
const HTTP_OK_200 = 200
const SUCCESS = 'success'
const TABLE = 'aws-dynamodb-starter'
// Routes
app.get('/', (req, res) => {
  res.send({
    message: `Request received: ${req.method} - ${req.path}`,
    status: HTTP_OK_200,
    success: SUCCESS,
  })
})

app.post('/user/add', (req, res) => {
  let d = new Date()
  const user_email = req.body.email
  const user_id = req.body.sub
  const date = d.toISOString()
  var params = {
    TableName: TABLE,
    Item: {
      ID: user_id,
      email: user_email,
      info: {
        uuid: uuidv4(),
        date_created: date,
        image_urls: [],
      },
    },
  }
  docClient.put(params, (err, data) => {
    if (err) {
      res.send(err)
    } else {
      console.log('Added item:', JSON.stringify(data, null, 2))
      res.send({ data: data, parameters: params, status: HTTP_OK_200, success: SUCCESS })
    }
  })
})

// Error handler
app.use((err, req, res) => {
  console.error(err)
  res.status(500).send('Internal Serverless Error')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = app
