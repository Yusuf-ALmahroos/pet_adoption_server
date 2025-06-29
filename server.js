const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const AuthRouter = require('./routes/AuthRouter');
const CommentRouter = require('./routes/CommentRouter');
const PetRouter = require('./routes/PetRouter')
const AdoptRouter = require('./routes/AdoptionRequestRouter')


const PORT = process.env.PORT || 3000;

const db = require('./db')

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/auth', AuthRouter);
app.use('/comments', CommentRouter);
app.use('/pets', PetRouter);
app.use('/adoptions', AdoptRouter);

app.use('/', (req, res)=>{
    res.send('Connected to GA Pet Adoption Server')
});

app.listen(PORT, ()=>{
    console.log(`Running Express GA Pet Adoption server on Port ${PORT} . . .`)
});

