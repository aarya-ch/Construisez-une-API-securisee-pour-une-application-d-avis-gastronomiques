require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const path = require('path');

const sauceRoutes = (require('./routes/sauce'));
const userRoutes = (require('./routes/user'));

let obj = {
  description: "<h1> fzefz ef</h1>",
  title: "<p> fzefz ef</p>"
}

const uri = 'mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@cluster0-shard-00-00.apqro.mongodb.net:27017,cluster0-shard-00-01.apqro.mongodb.net:27017,cluster0-shard-00-02.apqro.mongodb.net:27017/sopecocko?ssl=true&replicaSet=atlas-4ogc6z-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(uri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;