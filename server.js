const express = require('express');
const logger = require('morgan');
const cors = require('cors');




const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/', (req, res)=>{
    res.send('Connected to GA Pet Adoption Server')
});

app.listen(PORT, ()=>{
    console.log(`Running Express GA Pet Adoption server on Port ${PORT} . . .`)
});

