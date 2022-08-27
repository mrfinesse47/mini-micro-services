const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

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
  res.send(posts);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

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
    console.log('comment updated');
    console.log(data);
  }

  res.status(201).send({ message: 'success' });
});

app.listen(4002, () => {
  console.log('listening on port 4002');
});
