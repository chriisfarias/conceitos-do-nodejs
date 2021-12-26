const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user){
    return response.status(404).json({error: "Usuário não existente"});
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {
  
  const { name, username } = request.body;

  if(users.find((user) => user.username === username)){
    return response.status(400).json({error: 'Usuário já existe!'})
  }

  const newuser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newuser);
  
  return response.status(201).json(newuser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
 
  const { user } = request;

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
 
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;
  
  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status(404).json({error: 'Todo not found!'})
  }
  
  const index = user.todos.indexOf(todo);
  user.todos[index].title = title;
  user.todos[index].deadline = deadline;

  return response.status(200).json(todo);
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  
  const { id } = request.params;
  const { user } = request; 

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status(404).json({error: 'Todo not found!'})
  }
  
  const index = user.todos.indexOf(todo);

  user.todos[index].done = true;

  return response.status(200).json(user.todos[index]);
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status(404).json({error: 'Non-existing to do'})
  }

  const index = user.todos.indexOf(todo);

  user.todos.splice(index, 1);

  return response.status(204).send();

});

module.exports = app;