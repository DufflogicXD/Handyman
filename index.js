const Joi = require('joi');
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
  const { error } = validateUser(req.body);
  if(error) return res.status(400).send(error.details[0].message);
  
  const user = {
    id: users.length + 1,
    name: req.body.name
  };
  users.push(user);
  res.send(user);
});

app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if( !user ) return res.status(404).send('The user with the given ID could not be found');
  
  const { error } = validateUser(req.body);
  if(error){
    res.status(400).send(error.details[0].message);
  }
});

function validateUser(user){
  const schema = {
    name: Joi.string().min(3).required()
  }
  
  return Joi.validate(user, schema)
  
}
