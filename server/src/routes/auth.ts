import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

/**
 * POST /api/auth/login
 * Body: { phoneNumber: string, password: string }
 * Returns JWT token + user data on success
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, email, password } = req.body;

    // --- Validation ---
    if ((!phoneNumber && !email) || !password) {
      res.status(400).json({
        success: false,
        message: 'Phone number or email, and password are required.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
      return;
    }

    // --- Find user ---
    let user = null;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    } else if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'No account found with these credentials.',
      });
      return;
    }

    // --- Compare password ---
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
      return;
    }

    // --- Generate JWT ---
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    const jwtExpiresInDays = parseInt(process.env.JWT_EXPIRES_IN || '7', 10);
    const expiresInSeconds = jwtExpiresInDays * 24 * 60 * 60;

    const token = jwt.sign(
      { userId: user._id, phoneNumber: user.phoneNumber },
      jwtSecret,
      { expiresIn: expiresInSeconds }
    );

    // --- Success response ---
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
});

export default router;
