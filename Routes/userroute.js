import express from 'express'
import { body, validationResult } from 'express-validator'
import usermodel from '../models/usermodel.js'
import bycrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import user from '../models/usermodel.js'
const router = express.Router()






router.post('/register',
    body('email').trim().isEmail().isLength({ min: 10 }),
    body('password').trim().isLength({ min: 5 }),
    body('username').trim().isLength({ min: 5 }), async (req, res) => {
        const result = validationResult(req)
        const { email, password, username } = req.body
        const hashedPassword = await bycrypt.hash(password, 10)
        const userdata = await usermodel.create({
            email,
            password: hashedPassword,
            username
        })
        await userdata.save()
        res.status(200).send({
            sucess: true,
            message: 'successfully created user'
        })
    })


router.post('/login',
    body('email').trim().isEmail().isLength({ min: 10 }),
    body('password').trim().isLength({ min: 5 }), async (req, res) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return res.status(400).send({
                sucess: false,
                result: result.array(),
                message: 'validation error'
            })
        }
        const { email, password } = req.body
        const user = await usermodel.findOne({ email })
        if (!user) {
            return res.status(400).send({
                sucess: false,
                message: 'email and password are incorrect'
            })
        }

        const isMatch = await bycrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).send({
                sucess: false,
                token,
                message: 'email and password not match'
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.cookie('token', token)

        res.status(200).send({
            sucess: true,
            message: 'login successfully'
        })
    })

export default router