import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { user: { id: userId } },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short lived access token
  );

  const refreshToken = jwt.sign(
    { user: { id: userId } },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Long lived refresh token
  );

  return { accessToken, refreshToken };
};

// Register user
router.post('/register', async (req, res) => {
  const { name, email, password, age } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      age
    });

    const { accessToken, refreshToken } = generateTokens(user.id);
    user.refreshToken = refreshToken; // Save to database for revocation mapping
    await user.save();

    res.json({ 
      accessToken, 
      refreshToken, 
      user: { id: user.id, name: user.name, email: user.email, age: user.age } 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user.id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ 
      accessToken, 
      refreshToken, 
      user: { id: user.id, name: user.name, email: user.email, age: user.age } 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Verify against database to ensure it's not revoked
    const user = await User.findById(decoded.user.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Refresh token revoked or invalid' });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { user: { id: user.id } },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken, refreshToken: token });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
