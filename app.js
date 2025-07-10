import express from 'express'
import userouter from './Routes/userroute.js'
import dotenv from 'dotenv'
import connectedDB from './config/db.js'
import cookieParser from 'cookie-parser'
import uplodfile from './Routes/uplodfile.js'
import cors from 'cors'
import formidable from 'formidable'
dotenv.config()
connectedDB()

const app = express()
//middelware
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use('/user', userouter)
app.use('/', uplodfile)

app.use(cookieParser())

app.get('/', async (req, res) => {
    res.send('hello from home finaly bro running')
})


app.listen(3000, () => {
    console.log('server successfully run')
})

export default app