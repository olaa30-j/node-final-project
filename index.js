const express = require('express');
const app = express();
const cors = require('cors');
const routes = require('./route/route');
require('./config/connect');


app.use(cors());
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use('/user', routes);
app.get('/', (req, res) => res.send('Hello World!'));

app.listen(
    5500, () =>
    console.log(`success you are on localhost ${port}!`
    ));
