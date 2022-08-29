const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// example post

const posts = {};

// posts = {
//   j23323: {
//     id: "54545",
//     title: "hello",
//     comments: [{ id: "ndnfdksf", content: "hellow world" }],
//   },
//   j23329: {
//     id: "54547",
//     title: "hello 88",
//     comments: [{ id: "ndnksf", content: "yo" }],
//   },
// };

app.use(cors());

app.get('/posts', (req, res) => {
  console.log(posts);
  res.send(posts);
});

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }
  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    post.comments.push({ id, content, status });
  }
  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    const comment = post.comments.find((comment) => comment.id === id);
    comment.status = status;
    comment.content = content;
    comment.postId = postId;
    comment.id = id;
  }
};

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.status(201).send({ message: 'success' });
});

app.listen(4002, async () => {
  console.log('listening on port 4002');
  const res = await axios.get('http://event-bus-srv/events');
  console.log(res);
  for (let event of res.data) {
    console.log('processing event: ', event.type);
    handleEvent(event.type, event.data);
  }
});
