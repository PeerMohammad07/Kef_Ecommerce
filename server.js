const dotenv = require("dotenv")
dotenv.config()

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URL)

const express = require("express")
const app = express()

const nocache = require('nocache')
app.use(nocache())

const flash = require("express-flash")
app.use(flash())

const path = require('path')
app.use('/static', express.static(path.join(__dirname, 'public/assets')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets/images')));
app.use(express.static(path.join(__dirname, 'public/admin/assets')))

const userRoute = require('./routes/userRoute')
app.use('/', userRoute)

const adminRoute = require("./routes/adminRoute")
app.use('/admin', adminRoute)

// Server
let port = process.env.PORT
app.listen(port, () => console.log(`http://localhost:${port}`))


