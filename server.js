const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://shrivignesh:sih1286@atlascluster.pv8ypti.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});
// Create a new model for the key signatory information
const KeySignatory = mongoose.model('KeySignatory', {
  firstName: String,
  middleName: String,
  lastName: String,
  email: String,
  phone: String,
  aadhar: String,
  dob: Date,
  state: String,
  city: String,
  pincode: String,
});

// Create a new route to handle the POST request
app.post('/save-key-signatory', async (req, res) => {
  // Get the key signatory information from the POST request body
  const keySignatory = req.body;

  // Create a new key signatory record from the POST request body
  const newKeySignatory = new KeySignatory({
    firstName: keySignatory.firstName,
    middleName: keySignatory.middleName,
    lastName: keySignatory.lastName,
    email: keySignatory.email,
    phone: keySignatory.phone,
    aadhar: keySignatory.aadhar,
    dob: keySignatory.dob,
    state: keySignatory.state,
    city: keySignatory.city,
    pincode: keySignatory.pincode,
  });

  // Save the key signatory record to the database
  await newKeySignatory.save();

  // Send a success response to the client
  res.status(201).json({ message: 'Key Signatory Saved!' });
});

const User = mongoose.model('User', {
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
});


// Routes
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
  const { email, password, userType } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        if (userType === 'user') {
          res.redirect('/impact/index.html');
        } else if (userType === 'admin') {
          res.redirect('/impact/sindex.html');
        } else {
          res.status(400).json({ message: 'Invalid userType' });
        }
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
