
// ############################################################################
//----------------- QUOTATION RELATED CRUD FUNCTIONS-----------------------
// ############################################################################


const Joi = require('joi');           //Joi for input validation
const express = require('express');
const router = express.Router();

const QUOTATION_TABLE     = process.env.QUOTATION_TABLE;
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


//GET ALL QUOTATION
router.get('/', (req, res) => {
    const query = "SELECT * FROM " + QUOTATION_TABLE;
    pool.query(query, (error, results) =>{
      if (!results) res.json({status: "Not found!"});
      else res.json(results);
    })
});
  
//GET a specific QUOTATION by ID
router.get('/:id', (req, res) => {
const query = "SELECT * FROM " + QUOTATION_TABLE
            + " WHERE id = ?";
pool.query(query, [req.params.id], (error, results) =>{
    if (!results[0]) res.json({status: "Not found!"});
    else res.json(results[0]);
})
});


// NEW QUOTATION
router.post('/', (req, res) => {
const { error } = validateQuotation(req.body);
if(error) return res.status(400).send(error.details[0].message);

const data = {
    CustomerID:       req.body.CustomerID,
    BusinessID:       req.body.BusinessID,
    ServiceJobID:     req.body.ServiceJobID,
    Price:            req.body.Price
}

const query = "INSERT INTO " + QUOTATION_TABLE
            + " (CustomerID, BusinessID, ServiceJobID, Price)"
            + " values (?,?,?,?)";
pool.query(query, Object.values(data), (error) =>{
    if (error) res.json({status: "Failure!", reason: error.code});
    else res.json({status: "success", data: data});
})
});



// DELETE specific QUOTATION by ID
router.delete('/:id', (req, res) => {
//first check to see if there is a quotation with that ID
let query = "SELECT * FROM " + QUOTATION_TABLE 
            + " WHERE id = ?";

pool.query(query, [req.params.id], (error, results) =>{
    //if no quotation with that id could be found
    if (!results[0]) res.json({status: "Could not find a Quotation with that ID to delete"});
    else {
    query = "DELETE FROM " + QUOTATION_TABLE
            + " WHERE id = ?";
    pool.query(query, [req.params.id], (error, results) =>{
        if (error) res.json({status: "error", reason: error.code});
        else res.json({status: "success", reason: results});
    })
    }
})
});

// UPDATE QUOTATION
router.put('/:id', (req, res) => {
//first check to see if there is a quotation with that ID
let query = "SELECT * FROM " + QUOTATION_TABLE
            + " WHERE id = ?";

//return with error if data does not pass validation
const { error } = validateQuotation(req.body);
if(error) return res.status(400).send(error.details[0].message);

const data = {
    CustomerID:       req.body.CustomerID,
    BusinessID:       req.body.BusinessID,
    ServiceJobID:     req.body.ServiceJobID,
    Price:            req.body.Price,
    ID:               req.params.id
}

pool.query(query, [req.params.id], (error, results) =>{
    //if no quotation with that id could be found
    if (!results[0]) res.json({status: "Could not find a Quotation with that ID to update"});
    else {
    //update the quotation that was found
    query = "UPDATE " + QUOTATION_TABLE
            + " SET CustomerID = ?, BusinessID = ?, ServiceJobID = ?, Price = ?"
            + " WHERE id = ?";
    pool.query(query, Object.values(data), (error) =>{
        if (error) res.json({status: "Failure!", reason: error.code});
        else res.json({status: "success", data: data});
    })
    }
})
});

//VALIDATION
function validateQuotation(quotation){
const schema = Joi.object({
    CustomerID:       Joi.number().positive(),
    BusinessID:       Joi.number().positive(),
    ServiceJobID:     Joi.number().positive(),
    Price:            Joi.number().precision(2).positive()
});

return schema.validate(quotation);
}


module.exports = router;
  