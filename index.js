// run the api server   -    nodemon index.js 

const Joi     = require('joi');           //Joi for input validation
const express = require('express');
const app     = express();
const PORT    = 8080;

require('dotenv').config();

const DATABASE_HOST       = process.env.DATABASE_HOST;
const DATABASE_USER       = process.env.DATABASE_USER;
const DATABASE_PASSWORD   = process.env.DATABASE_PASSWORD

// Load module
var mysql = require('mysql');
const e = require('express');
const { request } = require('express');
// Initialize pool
var pool      =    mysql.createPool({
    connectionLimit : 10,
    host     : DATABASE_HOST,
    user     : DATABASE_USER,
    password : DATABASE_PASSWORD,
    database : 'handyman',
    debug    :  true
});    
module.exports = pool;

app.use(express.json());


//----------------- CUSTOMER USER ROUTING-----------------------
const customerUserRouter = require('./routes/customerusers');
app.use('/customerusers', customerUserRouter);


//----------------- BUSINESS USER RELATED ROUTING-----------------------
const businessUserRouter = require('./routes/businessusers');
app.use('/businessusers', businessUserRouter);


//----------------- MESSAGE RELATED ROUTING-----------------------
const messageRouter = require('./routes/messages');
app.use('/messages', messageRouter);


//----------------- SERVICE JOB RELATED ROUTING-----------------------
const serviceJobRouter = require('./routes/servicejobs');
app.use('/servicejobs', serviceJobRouter);


//----------------- QUOTATION RELATED ROUTING-----------------------
const quotationRouter = require('./routes/quotations');
app.use('/quotations', quotationRouter);

//----------------- REVIEW RELATED ROUTING-----------------------
const reviewRouter = require('./routes/reviews');
app.use('/reviews', reviewRouter);





//Start the app on the given port number
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
