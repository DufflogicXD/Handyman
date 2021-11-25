// ############################################################################
//----------------- BUSINESS USER RELATED CRUD FUNCTIONS-----------------------
// ############################################################################

const Joi = require('joi');           //Joi for input validation
const express = require('express');
const router = express.Router();

const BUSINESS_USER_TABLE = process.env.BUSINESS_USER_TABLE;
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



//GET ALL BUSINESS USERS
router.get('/', (req, res) => {
    const query = "SELECT * FROM " + BUSINESS_USER_TABLE;
    pool.query(query, (error, results) =>{
      if (!results) res.json({status: "Not found!"});
      else res.json(results);
    })
});
  
  //GET a specific BUSINESS USER by ID
router.get('/:id', (req, res) => {
    const query = "SELECT * FROM " + BUSINESS_USER_TABLE
                + " WHERE id = ?";
    pool.query(query, [req.params.id], (error, results) =>{
      if (!results[0]) res.json({status: "Not found!"});
      else res.json(results[0]);
    })
});
  
  
  // NEW BUSINESS USER
router.post('/', (req, res) => {
    const { error } = validateBusinessUser(req.body);
    if(error) return res.status(400).send(error.details[0].message);
  
    const data = {
      BusinessName:   req.body.BusinessName,
      Bio:            req.body.Bio,
      Email:          req.body.Email,
      Phone:          req.body.Phone
    }
    
    const query = "INSERT INTO " + BUSINESS_USER_TABLE
                + " (BusinessName, Bio, Email, Phone)" 
                + " values (?,?,?,?)";
    pool.query(query, Object.values(data), (error) =>{
      if (error) res.json({status: "Failure!", reason: error.code});
      else res.json({status: "success", data: data});
    })
});
  
  
  
  // DELETE specific BUSINESS USER by ID
router.delete('/:id', (req, res) => {
    //first check to see if there is a user with that ID
    let query = "SELECT * FROM " + BUSINESS_USER_TABLE
              + " WHERE id = ?";
  
    pool.query(query, [req.params.id], (error, results) =>{
      //if no user with that id could be found
      if (!results[0]) res.json({status: "Could not find a user with that ID to delete"});
      else {
        query = "DELETE FROM " + BUSINESS_USER_TABLE
              + " WHERE id = ?";
        pool.query(query, [req.params.id], (error, results) =>{
          if (error) res.json({status: "error", reason: error.code});
          else res.json({status: "success", reason: results});
        })
      }
    })
});
  
  // UPDATE BUSINESS USER
router.put('/:id', (req, res) => {
    //first check to see if there is a user with that ID
    let query = "SELECT * FROM " + BUSINESS_USER_TABLE
              + " WHERE id = ?";
  
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
            query = "UPDATE " + BUSINESS_USER_TABLE
                + " SET BusinessName = ?, Bio = ?, Email = ?, Phone = ?" 
                + " WHERE id = ?";
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

module.exports = router;