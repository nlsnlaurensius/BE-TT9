const express = require('express');
const cors = require('cors');
require('dotenv').config();
const todoRoutes = require('./src/routes/todo.route');
const userRoutes = require('./src/routes/user.route');
const db = require('./src/database/pg.database');
const { errorResponse } = require('./src/utils/baseResponse.util');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);

app.get('/', (req, res) => {
  res.send('To-Do List Backend with User Authentication is running!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json(errorResponse('Something went wrong!', err.message));
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

db.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error', err.stack));