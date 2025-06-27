import express from 'express'
import userouter from './Routes/userroute.js'
import dotenv from 'dotenv'
import connectedDB from './config/db.js'
import cookieParser from 'cookie-parser'

dotenv.config()
connectedDB()

const app = express()
//middelware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/user', userouter)
app.use(cookieParser())

app.get('/', async (req, res) => {

    res.send('hello from home')

})

app.listen(3000, () => {
    console.log('server successfully run')
})