const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;
const MONGODB_URI = 'mongodb+srv://shrivignesh:sih1286@atlascluster.pv8ypti.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'test'; // Specify the database name "test"
const collectionName = 'keysignatories'; // Replace with the name of your collection

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', async (req, res) => {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(dbName);

    const collections = await db.listCollections().toArray();
    
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();

    res.render('index', { collections, documents });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error');
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
