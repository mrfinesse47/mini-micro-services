const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/posts', (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;
  posts[id] = { id, title };

  axios
    .post('http://event-bus-srv:4005/events', {
      type: 'PostCreated',
      data: { id, title },
    })
    .then(() => {
      res.status(201).send(posts[id]);
    })
    .catch((e) => {
      console.log(e);
    });
});

app.post('/events', (req, res) => {
  console.log('received event:', req.body.type);
  res.send({});
});

app.listen(4000, () => {
  console.log('v0.0.7');
  console.log('listening on port 4000');
});
