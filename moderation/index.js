const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  console.log(type, data);

  if (type === 'CommentCreated') {
    const status = data.content.includes('orange') ? 'rejected' : 'approved';
    try {
      await axios.post('http://event-bus-srv/events', {
        type: 'CommentModerated',
        data: {
          id: data.id,
          postId: data.postId,
          status,
          content: data.content,
        },
      });
    } catch (e) {
      console.log('failed on type:', type);
    }
  }
  res.send({ message: 'moderation successful' });
});

app.listen(4003, () => {
  console.log('listening on port 4003');
});
