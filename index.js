// run the api server   -    nodemon index.js 

const Joi = require('joi');           //Joi for input validation
const express = require('express');
const app = express();
const PORT = 8080;
require('dotenv').config();

const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD
const DATABASE = process.env.DATABASE;

console.log(DATABASE_HOST + " " + DATABASE_USER);
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


app.get('/', (req, res) => {
  res.send('Hello World');  
});


// ############################################################################
//----------------- CUSTOMER USER RELATED CRUD FUNCTIONS-----------------------
// ############################################################################

//GET ALL USERS
app.get('/api/users', (req, res) => {
  const query = "select * from CUSTOMERUSER";
  pool.query(query, (error, results) =>{
    if (!results) res.json({status: "Not found!"});
    else res.json(results);
  })
});

//GET a specific USER by ID
app.get('/api/users/:id', (req, res) => {
  const query = "select * from CUSTOMERUSER WHERE id = ?";
  pool.query(query, [req.params.id], (error, results) =>{
    if (!results[0]) res.json({status: "Not found!"});
    else res.json(results[0]);
  })
});


// NEW USER
app.post('/api/users', (req, res) => {
  const { error } = validateCustomerUser(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const data = {
    FirstName:    req.body.FirstName,
    SecondName:   req.body.SecondName,
    Email:        req.body.Email,
    Phone:        req.body.Phone,
    Address:      req.body.Address,
    Town:         req.body.Town,
    DateCreated:  new Date,
    Eircode:      req.body.Eircode,
    Rating:       0
  }
  
  const query = "INSERT INTO CUSTOMERUSER (FirstName, SecondName, Email, " 
              + "Phone, Address, Town, DateCreated, Eircode, Rating) values (?,?,?,?,?,?,?,?,?)";
  pool.query(query, Object.values(data), (error) =>{
    if (error) res.json({status: "Failure!", reason: error.code});
    else res.json({status: "success", data: data});
  })
});



// DELETE specific USER by ID
app.delete('/api/users/:id', (req, res) => {
  //first check to see if there is a user with that ID
  let query = "select * from CUSTOMERUSER WHERE id = ?";

  pool.query(query, [req.params.id], (error, results) =>{
    //if no user with that id could be found
    if (!results[0]) res.json({status: "Could not find a user with that ID to delete"});
    else {
      query = "DELETE from CUSTOMERUSER WHERE id = ?";
      pool.query(query, [req.params.id], (error, results) =>{
        if (error) res.json({status: "error", reason: error.code});
        else res.json({status: "success", reason: results});
      })
    }
  })
});

// UPDATE USER
app.put('/api/users/:id', (req, res) => {
  //first check to see if there is a user with that ID
  let query = "select * from CUSTOMERUSER WHERE id = ?";

  //return with error if data does not pass validation
  const { error } = validateCustomerUser(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const data = {
    FirstName:    req.body.FirstName,
    SecondName:   req.body.SecondName,
    Email:        req.body.Email,
    Phone:        req.body.Phone,
    Address:      req.body.Address,
    Town:         req.body.Town,
    Eircode:      req.body.Eircode,
    ID:           req.params.id
  }
  
  pool.query(query, [req.params.id], (error, results) =>{
    //if no user with that id could be found
    if (!results[0]) res.json({status: "Could not find a user with that ID to update"});
    else {
      query = "UPDATE CUSTOMERUSER SET FirstName = ?, SecondName = ?, Email = ?, Phone = ?, "
            + "Address = ?, Town = ?, Eircode = ? WHERE id = ?";
      pool.query(query, Object.values(data), (error) =>{
        if (error) res.json({status: "Failure!", reason: error.code});
        else res.json({status: "success", data: data});
      })
    }
  })
});


//VALIDATION
function validateCustomerUser(user){
  const schema = Joi.object({
    FirstName: Joi.string().max(30).min(2).required(),
    SecondName: Joi.string().max(30).min(2).required(),
    Email: Joi.string().max(45).min(6).required().email({ minDomainSegments: 2}),
    Phone: Joi.string().max(15).min(8).required(),
    Address: Joi.string().max(50).min(2).required(),
    Town: Joi.string().max(25).min(2).required(),
    DateCreated: Joi.date(),
    Eircode: Joi.string().max(7).min(7).required(),
    Rating: Joi.number()
  });
  
  return schema.validate(user);
  
}


// ############################################################################
//----------------- BUSINESS USER RELATED CRUD FUNCTIONS-----------------------
// ############################################################################

//GET ALL BUSINESS USERS
app.get('/api/businessusers', (req, res) => {
  const query = "select * from BUSINESSUSER";
  pool.query(query, (error, results) =>{
    if (!results) res.json({status: "Not found!"});
    else res.json(results);
  })
});

//GET a specific BUSINESS USER by ID
app.get('/api/businessusers/:id', (req, res) => {
  const query = "select * from BUSINESSUSER WHERE id = ?";
  pool.query(query, [req.params.id], (error, results) =>{
    if (!results[0]) res.json({status: "Not found!"});
    else res.json(results[0]);
  })
});


// NEW BUSINESS USER
app.post('/api/businessusers', (req, res) => {
  const { error } = validateBusinessUser(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const data = {
    BusinessName:   req.body.BusinessName,
    Bio:            req.body.Bio,
    Email:          req.body.Email,
    Phone:          req.body.Phone
  }
  
  const query = "INSERT INTO BUSINESSUSER (BusinessName, Bio, Email, Phone) values (?,?,?,?)";
  pool.query(query, Object.values(data), (error) =>{
    if (error) res.json({status: "Failure!", reason: error.code});
    else res.json({status: "success", data: data});
  })
});



// DELETE specific BUSINESS USER by ID
app.delete('/api/businessusers/:id', (req, res) => {
  //first check to see if there is a user with that ID
  let query = "select * from BUSINESSUSER WHERE id = ?";

  pool.query(query, [req.params.id], (error, results) =>{
    //if no user with that id could be found
    if (!results[0]) res.json({status: "Could not find a user with that ID to delete"});
    else {
      query = "DELETE from BUSINESSUSER WHERE id = ?";
      pool.query(query, [req.params.id], (error, results) =>{
        if (error) res.json({status: "error", reason: error.code});
        else res.json({status: "success", reason: results});
      })
    }
  })
});

// UPDATE BUSINESS USER
app.put('/api/businessusers/:id', (req, res) => {
  //first check to see if there is a user with that ID
  let query = "select * from BUSINESSUSER WHERE id = ?";

  //return with error if data does not pass validation
  const { error } = validateBusinessUser(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const data = {
    BusinessName:   req.body.BusinessName,
    Bio:            req.body.Bio,
    Email:          req.body.Email,
    Phone:          req.body.Phone,
    ID:             req.params.id
  }
  
  pool.query(query, [req.params.id], (error, results) =>{
    //if no user with that id could be found
    if (!results[0]) res.json({status: "Could not find a user with that ID to update"});
    else {
      //update the user that was found
      query = "UPDATE BUSINESSUSER SET BusinessName = ?, Bio = ?, Email = ?, Phone = ? WHERE id = ?";
      pool.query(query, Object.values(data), (error) =>{
        if (error) res.json({status: "Failure!", reason: error.code});
        else res.json({status: "success", data: data});
      })
    }
  })
});

//VALIDATION
function validateBusinessUser(user){
  const schema = Joi.object({
    BusinessName: Joi.string().max(40).min(3).required(),
    Bio: Joi.string().max(200).min(2).required(),
    Email: Joi.string().max(45).min(6).required().email({ minDomainSegments: 2}),
    Phone: Joi.string().max(15).min(8).required()
  });
  
  return schema.validate(user);
}


// ############################################################################
//----------------- Message RELATED CRUD FUNCTIONS-----------------------
// ############################################################################

//GET ALL MESSAGES
app.get('/api/messages', (req, res) => {
  const query = "select * from MESSAGE";
  pool.query(query, (error, results) =>{
    if (!results) res.json({status: "Not found!"});
    else res.json(results);
  })
});

//GET a specific MESSAGE by ID
app.get('/api/messages/:id', (req, res) => {
  const query = "select * from MESSAGE WHERE id = ?";
  pool.query(query, [req.params.id], (error, results) =>{
    if (!results[0]) res.json({status: "Not found!"});
    else res.json(results[0]);
  })
});


// NEW MESSAGE
app.post('/api/messages', (req, res) => {
  const { error } = validateMessage(req.body);
  if(error) return res.status(400).send(error.details[0].message);  

  const data = {
    Message:      req.body.Message,
    Seen:         null,
    DateSent:     new Date(),
    DateReceived: null,
    BusinessID:   req.body.BusinessID,
    CustomerID:   req.body.CustomerID
  }
  
  const query = "INSERT INTO MESSAGE (Message, Seen, DateSent, DateReceived, BusinessID, CustomerID)"+
              "values (?,?,?,?,?,?)";
  pool.query(query, Object.values(data), (error) =>{
    if (error) res.json({status: "Failure!", reason: error.code});
    else res.json({status: "success", data: data});
  })
});



// DELETE SPECIFIC MESSAGE by ID
app.delete('/api/messages/:id', (req, res) => {
  //first check to see if there is a message with that ID
  let query = "select * from MESSAGE WHERE id = ?";

  pool.query(query, [req.params.id], (error, results) =>{
    //if no message with that id could be found
    if (!results[0]) res.json({status: "Could not find a message with that ID to delete"});
    else {
      query = "DELETE from MESSAGE WHERE id = ?";
      pool.query(query, [req.params.id], (error, results) =>{
        if (error) res.json({status: "error", reason: error.code});
        else res.json({status: "success", reason: results});
      })
    }
  })
});

// UPDATE MESSAGE
app.put('/api/messages/:id', (req, res) => {
  //first check to see if there is a message with that ID
  let query = "select * from MESSAGE WHERE id = ?";

  //return with error if data does not pass validation
  const { error } = validateMessage(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const data = {
    Message:      req.body.Message,
    Seen:         null,
    DateSent:     new Date(),
    DateReceived: null,
    BusinessID:   req.body.BusinessID,
    CustomerID:   req.body.CustomerID,
    ID:           req.params.id
  }
  
  pool.query(query, [req.params.id], (error, results) =>{
    //if no message with that id could be found
    if (!results[0]) res.json({status: "Could not find a Message with that ID to update"});
    else {
      //update the message that was found
      query = "UPDATE MESSAGE SET Message = ?, "
      + "Seen = ?, DateSent = ?, DateReceived = ?, BusinessID = ?, CustomerID = ? WHERE id = ?";
      pool.query(query, Object.values(data), (error) =>{
        if (error) res.json({status: "Failure!", reason: error.code});
        else res.json({status: "success", data: data});
      })
    }
  })
});

//VALIDATION
function validateMessage(message){
  const schema = Joi.object({
    Message: Joi.string().max(1000).min(1).required(),
    BusinessID: Joi.number(),
    CustomerID: Joi.number()
  });
  
  return schema.validate(message);
}


// ############################################################################
//----------------- SERVICEJOB RELATED CRUD FUNCTIONS-----------------------
// ############################################################################

//GET ALL Service Job
app.get('/api/servicejobs', (req, res) => {
  const query = "select * from SERVICEJOB";
  pool.query(query, (error, results) =>{
    if (!results) res.json({status: "Not found!"});
    else res.json(results);
  })
});

//GET a specific Service Job by ID
app.get('/api/servicejobs/:id', (req, res) => {
  const query = "select * from SERVICEJOB WHERE id = ?";
  pool.query(query, [req.params.id], (error, results) =>{
    if (!results[0]) res.json({status: "Not found!"});
    else res.json(results[0]);
  })
});


// NEW SERVICE JOB
app.post('/api/servicejobs', (req, res) => {
  const { error } = validateServiceJob(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const data = {
    JobTitle:         req.body.JobTitle,
    Description:      req.body.Description,
    BriefDescription: req.body.BriefDescription,
    Category:         req.body.Category,
    CustomerID:       req.body.CustomerID,
    BusinessID:       req.body.BusinessID,
    QuotationID:      req.body.QuotationID,
    PostedDate:       new Date,
    DueDate:          req.body.DueDate,
    CompletedDate:    req.body.CompletedDate
  }
  
  const query = "INSERT INTO SERVICEJOB (JobTitle, Description, BriefDescription, Category, " 
              + "CustomerID, BusinessID, QuotationID, PostedDate, DueDate, CompletedDate) "
              + "values (?,?,?,?,?,?,?,?,?,?)";
  pool.query(query, Object.values(data), (error) =>{
    if (error) res.json({status: "Failure!", reason: error.code});
    else res.json({status: "success", data: data});
  })
});



// DELETE specific SERVICE JOB by ID
app.delete('/api/servicejobs/:id', (req, res) => {
  //first check to see if there is a user with that ID
  let query = "select * from SERVICEJOB WHERE id = ?";

  pool.query(query, [req.params.id], (error, results) =>{
    //if no user with that id could be found
    if (!results[0]) res.json({status: "Could not find a service job with that ID to delete"});
    else {
      query = "DELETE from SERVICEJOB WHERE id = ?";
      pool.query(query, [req.params.id], (error, results) =>{
        if (error) res.json({status: "error", reason: error.code});
        else res.json({status: "success", reason: results});
      })
    }
  })
});

// UPDATE SERVICE JOB
app.put('/api/servicejobs/:id', (req, res) => {
  //first check to see if there is a user with that ID
  let query = "select * from SERVICEJOB WHERE id = ?";

  //return with error if data does not pass validation
  const { error } = validateServiceJob(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const data = {
    JobTitle:         req.body.JobTitle,
    Description:      req.body.Description,
    BriefDescription: req.body.BriefDescription,
    Category:         req.body.Category,
    CustomerID:       req.body.CustomerID,
    BusinessID:       req.body.BusinessID,
    QuotationID:      req.body.QuotationID,
    PostedDate:       new Date,
    DueDate:          req.body.DueDate,
    CompletedDate:    req.body.CompletedDate,
    ID:               req.params.id
  }
  
  pool.query(query, [req.params.id], (error, results) =>{
    //if no user with that id could be found
    if (!results[0]) res.json({status: "Could not find a service job with that ID to update"});
    else {
      //update the user that was found
      query = "UPDATE servicejob SET JobTitle = ?, Description = ?, BriefDescription = ?, "
            + "Category = ?, CustomerID = ?, BusinessID = ?, QuotationID = ?, PostedDate = ?, "
            + "DueDate = ? WHERE id = ?";
      pool.query(query, Object.values(data), (error) =>{
        if (error) res.json({status: "Failure!", reason: error.code});
        else res.json({status: "success", data: data});
      })
    }
  })
});

//VALIDATION
function validateServiceJob(servicejob){
  const schema = Joi.object({
    JobTitle:         Joi.string().max(40).min(6).required(),
    Description:      Joi.string().max(1000).min(60).required(),
    BriefDescription: Joi.string().max(255).min(25).required(),
    Category:         Joi.number(),
    CustomerID:       Joi.number(),
    BusinessID:       Joi.number(),
    QuotationID:      Joi.number(),
    PostedDate:       Joi.date(),
    DueDate:          Joi.date(),
    CompletedDate:    Joi.date(),
  });
  
  return schema.validate(servicejob);
}




//Start the app on the given port number
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
