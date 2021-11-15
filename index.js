const express = require('express');
const app = express();

app.use(express.json());

const users = [
  { id: 1, name: 'user1' },
  { id: 2, name: 'user2' },
  { id: 3, name: 'user3' },
];

app.get('/api/users', (req, res) => {
  res.send(users);  
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if( !user ) return res.status(404).send('The user with the given ID could not be found');
  res.send(user);
  
});

app.post('/api/users', (req, res) => {
  const user = {
    id: users.length + 1,
    name: req.body.name
  };
  users.push(user);
  res.send(user);
});
