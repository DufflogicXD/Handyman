
// ############################################################################
//----------------- REVIEW RELATED CRUD FUNCTIONS-----------------------
// ############################################################################


const Joi = require('joi');           //Joi for input validation
const express = require('express');
const router = express.Router();

const REVIEW_TABLE        = process.env.REVIEW_TABLE;
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


//GET ALL REVIEW
router.get('/', (req, res) => {
    const query = "SELECT * FROM " + REVIEW_TABLE;
    pool.query(query, (error, results) =>{
      if (!results) res.json({status: "Not found!"});
      else res.json(results);
    })
  });
  
//GET a specific REVIEW by ID
router.get('/:id', (req, res) => {
const query = "SELECT * FROM " + REVIEW_TABLE
            + " WHERE id = ?";
pool.query(query, [req.params.id], (error, results) =>{
    if (!results[0]) res.json({status: "Not found!"});
    else res.json(results[0]);
})
});


// NEW REVIEW
router.post('/', (req, res) => {
const { error } = validateReview(req.body);
if(error) return res.status(400).send(error.details[0].message);

const data = {
    CustomerID:       req.body.CustomerID,
    BusinessID:       req.body.BusinessID,
    Comment:          req.body.Comment,
    Rating:           req.body.Rating
}

const query = "INSERT INTO " + REVIEW_TABLE
            + " (CustomerID, BusinessID, Comment, Rating)"
            + " values (?,?,?,?)";
pool.query(query, Object.values(data), (error) =>{
    if (error) res.json({status: "Failure!", reason: error.code});
    else res.json({status: "success", data: data});
})
});


// DELETE specific REVIEW by ID
router.delete('/:id', (req, res) => {
//first check to see if there is a review with that ID
let query = "SELECT * FROM " + REVIEW_TABLE 
            + " WHERE id = ?";

pool.query(query, [req.params.id], (error, results) =>{
    //if no review with that id could be found
    if (!results[0]) res.json({status: "Could not find a Review with that ID to delete"});
    else {
    query = "DELETE FROM " + REVIEW_TABLE
            + " WHERE id = ?";
    pool.query(query, [req.params.id], (error, results) =>{
        if (error) res.json({status: "error", reason: error.code});
        else res.json({status: "success", reason: results});
    })
    }
})
});

// UPDATE REVIEW
router.put('/:id', (req, res) => {
//first check to see if there is a review with that ID
let query = "SELECT * FROM " + REVIEW_TABLE
            + " WHERE id = ?";

//return with error if data does not pass validation
const { error } = validateReview(req.body);
if(error) return res.status(400).send(error.details[0].message);

const data = {
    CustomerID:       req.body.CustomerID,
    BusinessID:       req.body.BusinessID,
    Comment:          req.body.Comment,
    Rating:           req.body.Rating,
    ID:               req.params.id
}

pool.query(query, [req.params.id], (error, results) =>{
    //if no review with that id could be found
    if (!results[0]) res.json({status: "Could not find a Review with that ID to update"});
    else {
    //update the review that was found
    query = "UPDATE " + REVIEW_TABLE
            + " SET CustomerID = ?, BusinessID = ?, Comment = ?, Rating = ?"
            + " WHERE id = ?";
    pool.query(query, Object.values(data), (error) =>{
        if (error) res.json({status: "Failure!", reason: error.code});
        else res.json({status: "success", data: data});
    })
    }
})
});

//VALIDATION
function validateReview(review){
const schema = Joi.object({
    CustomerID:       Joi.number().positive(),
    BusinessID:       Joi.number().positive(),
    Comment:          Joi.string().max(1000).min(5),
    Rating:            Joi.number().precision(2).positive()
});

return schema.validate(review);
}

module.exports = router;
  