// ############################################################################
//----------------- Message RELATED CRUD FUNCTIONS-----------------------
// ############################################################################


const Joi = require('joi');           //Joi for input validation
const express = require('express');
const router = express.Router();

const MESSAGE_TABLE       = process.env.MESSAGE_TABLE;
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


//GET ALL MESSAGES
router.get('/', (req, res) => {
    const query = "SELECT * FROM MESSAGE";
    pool.query(query, (error, results) =>{
      if (!results) res.json({status: "Not found!"});
      else res.json(results);
    })
  });
  
  //GET a specific MESSAGE by ID
  router.get('/:id', (req, res) => {
    const query = "SELECT * FROM " + MESSAGE_TABLE
                + " WHERE id = ?";
    pool.query(query, [req.params.id], (error, results) =>{
      if (!results[0]) res.json({status: "Not found!"});
      else res.json(results[0]);
    })
  });
  
  
  // NEW MESSAGE
  router.post('/', (req, res) => {
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
    
    const query = "INSERT INTO " + MESSAGE_TABLE
                + " (Message, Seen, DateSent, DateReceived, BusinessID, CustomerID)"
                + " values (?,?,?,?,?,?)";
    pool.query(query, Object.values(data), (error) =>{
      if (error) res.json({status: "Failure!", reason: error.code});
      else res.json({status: "success", data: data});
    })
  });
  
  
  
  // DELETE SPECIFIC MESSAGE by ID
  router.delete('/:id', (req, res) => {
    //first check to see if there is a message with that ID
    let query = "SELECT * FROM " + MESSAGE_TABLE
              + " WHERE id = ?";
    pool.query(query, [req.params.id], (error, results) =>{
      //if no message with that id could be found
      if (!results[0]) res.json({status: "Could not find a message with that ID to delete"});
      else {
        query = "DELETE FROM " + MESSAGE_TABLE
              + " WHERE id = ?";
        pool.query(query, [req.params.id], (error, results) =>{
          if (error) res.json({status: "error", reason: error.code});
          else res.json({status: "success", reason: results});
        })
      }
    })
  });
  
  // UPDATE MESSAGE
  router.put('/:id', (req, res) => {
    //first check to see if there is a message with that ID
    let query = "SELECT * FROM " + MESSAGE_TABLE
              + " WHERE id = ?";
  
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
        query = "UPDATE " + MESSAGE_TABLE
              + " SET Message = ?, Seen = ?, DateSent = ?, DateReceived = ?," 
              + " BusinessID = ?, CustomerID = ?"
              + " WHERE id = ?";
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
      BusinessID: Joi.number().positive(),
      CustomerID: Joi.number().positive()
    });
    
    return schema.validate(message);
  }
  

  module.exports = router;