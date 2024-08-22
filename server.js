const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let users = [];

app.get('/', (req, res) => {
  res.send('server is responding');
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/users', (req, res) => {
  console.log('Received data:', req.body);
  users.push(req.body);
  res.status(201).json(req.body);
});

app.listen(8055, () => {
  console.log('server is running on port 8055');
});
