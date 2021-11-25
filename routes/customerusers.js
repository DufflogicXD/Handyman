// ############################################################################
//----------------- CUSTOMER USER RELATED CRUD FUNCTIONS-----------------------
// ############################################################################

const Joi = require('joi');           //Joi for input validation
const express = require('express');
const router = express.Router();

const CUSTOMER_USER_TABLE = process.env.CUSTOMER_USER_TABLE;
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


//GET ALL USERS
router.get('/', (req, res) => {
    const query = "SELECT * FROM " + CUSTOMER_USER_TABLE;
    pool.query(query, (error, results) =>{
      if (!results) res.json({status: "Not found!"});
      else res.json(results);
    })
  });
  
//GET a specific USER by ID
router.get('/:id', (req, res) => {
  const query = "SELECT * FROM " + CUSTOMER_USER_TABLE 
              + " WHERE id = ?";
  pool.query(query, [req.params.id], (error, results) =>{
    if (!results[0]) res.json({status: "Not found!"});
    else res.json(results[0]);
  })
});


// NEW USER
router.post('/', (req, res) => {
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
  
  const query = "INSERT INTO " + CUSTOMER_USER_TABLE
              + " (FirstName, SecondName, Email," 
              + " Phone, Address, Town, DateCreated, Eircode, Rating)"
              + " values (?,?,?,?,?,?,?,?,?)";
  pool.query(query, Object.values(data), (error) =>{
    if (error) res.json({status: "Failure!", reason: error.code});
    else res.json({status: "success", data: data});
  })
});



// DELETE specific USER by ID
router.delete('/:id', (req, res) => {
  //first check to see if there is a user with that ID
  let query = "SELECT * FROM " + CUSTOMER_USER_TABLE + 
            " WHERE id = ?";

  pool.query(query, [req.params.id], (error, results) =>{
    //if no user with that id could be found
    if (!results[0]) res.json({status: "Could not find a user with that ID to delete"});
    else {
      query = "DELETE FROM " + CUSTOMER_USER_TABLE 
            + " WHERE id = ?";
      pool.query(query, [req.params.id], (error, results) =>{
        if (error) res.json({status: "error", reason: error.code});
        else res.json({status: "success", reason: results});
      })
    }
  })
});

// UPDATE USER
router.put('/:id', (req, res) => {
  //first check to see if there is a user with that ID
  let query = "SELECT * FROM " + CUSTOMER_USER_TABLE 
            + " WHERE id = ?";

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
      query = "UPDATE " + CUSTOMER_USER_TABLE 
            + " SET FirstName = ?, SecondName = ?, Email = ?, Phone = ?,"
            + " Address = ?, Town = ?, Eircode = ?" 
            + " WHERE id = ?";
      pool.query(query, Object.values(data), (error) =>{
        if (error) res.json({status: "Failure!", reason: error.code});
        else res.json({status: "success", data: data});
      })
    }
  })
});


//VALIDATION
function validateCustomerUser(user){
  const schema =  Joi.object({
    FirstName:    Joi.string().max(30).min(2).required(),
    SecondName:   Joi.string().max(30).min(2).required(),
    Email:        Joi.string().max(45).min(6).required().email({ minDomainSegments: 2}),
    Phone:        Joi.string().max(15).min(8).required(),
    Address:      Joi.string().max(50).min(2).required(),
    Town:         Joi.string().max(25).min(2).required(),
    DateCreated:  Joi.date(),
    Eircode:      Joi.string().max(7).min(7).required(),
    Rating:       Joi.number().positive()
  });
  
  return schema.validate(user);
  
}
  
module.exports = router;