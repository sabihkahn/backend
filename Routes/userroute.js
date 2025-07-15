import express from 'express';
import { body, validationResult } from 'express-validator';
import usermodel from '../models/usermodel.js';
import bcrypt from 'bcrypt'; // spelling fixed
import jwt from 'jsonwebtoken';

const router = express.Router();

// ✅ Register Route
router.post('/register',
  body('email').trim().isEmail().isLength({ min: 10 }),
  body('password').trim().isLength({ min: 5 }),
  body('username').trim().isLength({ min: 5 }),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({
        success: false,
        message: 'Validation error',
        errors: result.array()
      });
    }

    const { email, password, username } = req.body;

    const existing = await usermodel.findOne({ email });
    if (existing) {
      return res.status(400).send({
        success: false,
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usermodel.create({
      email,
      password: hashedPassword,
      username
    });

    res.status(200).send({
      success: true,
      message: 'User successfully created'
    });
  }
);

// ✅ Login Route
router.post('/login',
  body('email').trim().isEmail().isLength({ min: 10 }),
  body('password').trim().isLength({ min: 5 }),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({
        success: false,
        message: 'Validation failed',
        errors: result.array()
      });
    }

    const { email, password } = req.body;
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: 'Email or password is incorrect'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: 'Email or password is incorrect'
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token);

    res.status(200).send({
      success: true,
      message: 'Login successful',
      user,
      token
    });
  }
);

export default router;
