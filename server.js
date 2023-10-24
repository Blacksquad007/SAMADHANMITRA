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

// MongoDB Models
// MongoDB Models
const KeySignatorySchema = new mongoose.Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    email: String,
    phone: String,
    aadhar: String,
    userId: String,
  });
  
  const KeySignatory = mongoose.model('KeySignatory', KeySignatorySchema);
  
  // Function to save key signatory information
  async function saveKeySignatoryInformation({
    firstName,
    middleName,
    lastName,
    email,
    phone,
    aadhar,
    userId,
  }) {
    // Create a new KeySignatory object
    const newKeySignatoryDocument = new KeySignatory({
      firstName,
      middleName,
      lastName,
      email,
      phone,
      aadhar,
      userId,
    });
  
    // Save the KeySignatory object to MongoDB
    await newKeySignatoryDocument.save();
  }
  
  // Route to handle the POST request from the keysigner.html file
  app.post('/saveKeySignatoryInformation', async (req, res) => {
    // Get the key signatory information from the request body
    const { firstName, middleName, lastName, email, phone, aadhar, userId } = req.body;
  
    // Save the key signatory information
    await saveKeySignatoryInformation({
      firstName,
      middleName,
      lastName,
      email,
      phone,
      aadhar,
      userId,
    });
  
    // Send a success response
    res.sendStatus(200);
  });
  
const User = mongoose.model('User', {
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
});

const KeySignatoryAndAddSigner = mongoose.model('KeySignatoryAndAddSigner', {
  firstName: String,
  middleName: String,
  lastName: String,
  email: String,
  phone: String,
  aadhar: String,
  userId: String,
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
