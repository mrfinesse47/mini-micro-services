const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: 'pending' });
  commentsByPostId[req.params.id] = comments;

  axios
    .post('http://event-bus-srv:4005/events', {
      type: 'CommentCreated',
      data: {
        id: commentId,
        content,
        postId: req.params.id,
        status: 'pending',
      },
    })
    .then(() => {
      res.status(201).send(comments);
      //should be able to see in XHR requests in client network tab
    })
    .catch((e) => {
      console.log(e);
    });
});

app.post('/events', async (req, res) => {
  const { type, data } = req.body;
  console.log(type, data);
  if (type === 'CommentModerated') {
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId];
    const comment = comments.find((comment) => comment.id === id);
    comment.status = status;
    try {
      await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentUpdated',
        data: { id, postId, status, content },
      });
    } catch (e) {
      console.log(e);
    }
  }

  res.send({});
});

app.listen(4001, () => {
  console.log('listening on port 4001');
});
