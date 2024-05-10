const express = require('express')
const cors = require('cors')
const app = express()
const router = express.Router()
require("./db/db_management");
const { getFirmDataFromAPI, getData } = require("./controllers/data")
const port = 3000;
app.use(cors())
app.set('trust proxy', 1) // trust first proxy
app.use(router.get('/main', getData))
app.use(router.get('/firm/:name', getFirmDataFromAPI))
// port
app.set('host', '127.0.0.1');
app.listen(port)