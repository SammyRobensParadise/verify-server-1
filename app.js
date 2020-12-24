'use strict'
// eslint-disable-next-line import/no-unresolved
const express = require('express')
var AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const bodyParser = require('body-parser')
require('dotenv').config()
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

const verifyAppCall = (req, res, next) => {
  const bearerHeader = req.headers['authorization']
  if (bearerHeader) {
    const bearer = bearerHeader.split(' ')
    const bearerToken = bearer[1]
    debugger
    if (bearerToken === process.env.SECURE_KEY) {
      next()
    } else {
      res.sendStatus(403)
    }
  } else {
    res.sendStatus(403)
  }
}

// constants
var docClient = new AWS.DynamoDB.DocumentClient()
// http codes
const HTTP_OK_200 = 200
const SUCCESS = 'success'
const TABLE = 'aws-dynamodb-starter'
// Routes
app.get('/', verifyAppCall, (req, res) => {
  res.send({
    message: `Request received: ${req.method} - ${req.path}`,
    status: HTTP_OK_200,
    success: SUCCESS,
  })
})

app.post('/user/add', verifyAppCall, (req, res) => {
  let d = new Date()
  const user_email = req.body.email
  const user_id = req.body.sub
  const date = d.toISOString()
  const params = {
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

app.get('/user', verifyAppCall, (req, res) => {
  const user_email = req.body.email
  const user_id = req.body.sub
  const params = {
    TableName: TABLE,
    Key: {
      ID: user_id,
      email: user_email,
    },
  }
  docClient.get(params, (err, data) => {
    if (err) {
      res.send(err)
    } else {
      res.send({ data: data, status: HTTP_OK_200, success: SUCCESS })
    }
  })
})

app.post('/user/url')

// Error handler
app.use((err, req, res) => {
  console.error(err)
  res.status(500).send('Internal Serverless Error')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = app
