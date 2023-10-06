const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse JSON and form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection URL
const url = 'mongodb://localhost:27017';

// Create a route to handle form submissions
app.post('/submit-form', (req, res) => {
  const formData = req.body;

  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error connecting to the database');
      return;
    }

    const db = client.db('mydatabase'); // Use your database name
    const collection = db.collection('formData'); // Use your collection name

    // Insert form data into the collection
    collection.insertOne(formData, (insertErr, result) => {
      if (insertErr) {
        console.error(insertErr);
        res.status(500).send('Error inserting data into the database');
      } else {
        console.log('Form data inserted successfully');
        res.status(200).send('Form data submitted successfully');
      }

      client.close();
    });
  });
});

// Serve your HTML file with the form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // Replace 'index.html' with your HTML file
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
