const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lt2wcqp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const craftCollection = client.db("craftDB").collection("craft");
    const anotherCraftCollection = client.db('craftDB').collection('anotherCraft');

    app.get('/craft', async (req, res) => {
      const cursor = craftCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post('/craft', async (req, res) => {
      const newCraft = req.body;
      console.log(newCraft);
      const result = await craftCollection.insertOne(newCraft);
      res.send(result);
    });

    app.delete('/craft/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await craftCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/craft/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await craftCollection.find({ email: req.params.userEmail }).toArray();
      res.send(result)
    });

    app.get('/craft/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await craftCollection.findOne(query);
      res.send(result);
    });

    app.put('/craft/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedCraft = req.body;

      const craft = {
        $set: {
          name: updatedCraft.name,
          subName: updatedCraft.subName,
          image: updatedCraft.image,
          price: updatedCraft.price,
          time: updatedCraft.time,
          rating: updatedCraft.rating,
          description: updatedCraft.description,
          stock: updatedCraft.stock,
          customizable: updatedCraft.customizable
        }
      }

      const result = await craftCollection.updateOne(filter, craft, options);
      res.send(result);
    });

    // another craft api making
    app.get('/anotherCraft', async (req, res) => {
      const cursor = anotherCraftCollection.find();
      const anotherCrafts = await cursor.toArray();
      res.send(anotherCrafts);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Craft making server is running')
})

app.listen(port, () => {
  console.log(`Craft Server is running on port: ${port}`)
})