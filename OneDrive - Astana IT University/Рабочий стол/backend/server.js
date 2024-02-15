const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('./models/user');
const axios = require('axios');
const crypto = require('crypto');
const https = require('https');

const app = express();
const PORT = 3000;

require("dotenv").config();

const generateRandomString = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length); 
};
const secretKey = generateRandomString(32); 


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true
}));

mongoose.connect(`mongodb+srv://boypurple60:diasiksal2003@cluster0.5tae3te.mongodb.net/Users`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: err.message });
  });
  

  app.get('/', (req, res) => {
    res.render('login');
  });
  
  app.get('/login', (req, res) => {
    res.render('login');
  });
  
  app.get('/register', (req, res) => {
    res.render('register');
  });
  

  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).render('error', { message: 'User not found' });
      }
  
      if (user.password !== password) {
        return res.status(401).render('error', { message: 'Incorrect password' });
      }
  
      req.session.user = user;
      res.redirect('/main');
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).render('error', { message: 'Internal server error' });
    }
  });
  

  app.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const existingUser = await User.findOne({ username });
  
      if (existingUser) {
        return res.status(400).render('error', { message: 'User already exists' });
      }
  
      const newUser = new User({
        username,
        password
      });
  
      await newUser.save();
  
      res.redirect('/login');
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).render('error', { message: 'Internal server error' });
    }
  });
  

  app.get('/main', async (req, res) => {
     try {
  
      res.render('main');
    } catch (error) {
      console.error('Error fetching data from database:', error);
      res.status(500).render('error', { message: 'Internal server error' });
    }
  });
  
  app.get('/admin', async (req, res) => {
    console.log(req.session.user);
    try {
      const users = await User.find({});
      if (req.session.user && req.session.user.isAdmin) {
        res.render('admin', { users, user: req.session.user, error: null });
      } else {
        res.status(403).send("Access Denied");
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).render('error', { message: 'Internal server error' });
    }
  });

  app.post('/admin/add', async (req, res) => {
    const { username, password, isAdmin } = req.body;
    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).render('error', { message: 'User already exists' });
      }
      const newUser = new User({
        username,
        password,
        isAdmin
      });
      await newUser.save();
      res.redirect('/admin');
    } catch (error) {
      console.error('Error adding user:', error);
      res.status(500).render('error', { message: 'Internal server error' });
    }
  });
  

  app.post('/admin/delete/:id', async (req, res) => {
    const userId = req.params.id;
    try {
      await User.findByIdAndDelete(userId);
      res.redirect('/admin');
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).render('error', { message: 'Internal server error' });
    }
  });
  

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: 'Internal server error' });
  });
  

  app.get("/weather", function (req, res) {
      const city = req.query.city;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
  
      https.get(url, function (response) {
          console.log(response.statusCode);
  
          response.on("data", function (data) {
              const weatherdata = JSON.parse(data);
              const temp = weatherdata.main.temp;
              const description = weatherdata.weather[0].description;
              const icon = weatherdata.weather[0].icon;
              const imgURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  
              res.write(`<h1>Temperature is ${temp} Celsius in ${city}</h1>`);
              res.write(`<h2>The weather currently is ${description}</h2>`);
              res.write(`<img src=${imgURL}>`);
              res.send();
          });
      });
  });
  
  
  app.get("/crypto", async function (req, res) {
      try {
          const cryptoResponse = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd");
          const cryptoData = cryptoResponse.data;
          res.json(cryptoData);
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: "Internal Server Error" });
      }
  });
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });