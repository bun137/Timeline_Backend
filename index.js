const express = require('express');
const app = express();
app.use(express.json());
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
console.log(uri);
async function connect_to_db() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  await client.connect();
  const dbName = 'clusteri0';
  const collectionName = 'editorData';

  const database = client.db(dbName);
  const collection = database.collection(collectionName);
  return [database, collection];
}

const connectMiddleware = async (req, res, next) => {
  const [db, col] = await connect_to_db();
  req.db = db;
  req.collection = col;
  next();
};

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!', name: 'John Doe' });
});

app.post('/save_data', connectMiddleware, async (req, res) => {
  let toInsert = req.body;
  toInsert.timeStamp = Date.now();
  await req.collection.insertOne(toInsert);
  res.sendStatus(200);
  // console.log(req.body.blocks[0].data.text);
});

app.get('/get_editor_data', connectMiddleware, async (req, res) => {
  const editori_id = req.query.editori_id;
  const result = await req.collection.findOne({ _id: editori_id });
  res.json(result);
});

app.get('/get_yevirithing', connectMiddleware, async (req, res) => {
  const result = await req.collection.find({}).toArray();
  res.json(result);
});

app.listen(5000, () => {
  console.log('Example app listening on port 5000!');
});

module.exports = app;
