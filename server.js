const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('impact'));

// Load environment variables from a .env file
require('dotenv').config();

// Connect to MongoDB Atlas using the URI from environment variables
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
  console.error('Error connecting to MongoDB Atlas:', err);
});

const User = mongoose.model('User', {
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
});

app.use(express.static('public'));

app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
      });

      await user.save();

      res.status(201).json({ message: 'Registration successful' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Registration error', error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Redirect to another page after successful login
        res.redirect('/Impact/index.html');
      } else {
        res.status(401).json({ message: 'Password does not match' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
