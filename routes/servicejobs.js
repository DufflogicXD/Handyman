// ############################################################################
//----------------- SERVICEJOB RELATED CRUD FUNCTIONS-----------------------
// ############################################################################


const Joi = require('joi');           //Joi for input validation
const express = require('express');
const router = express.Router();

const SERVICE_JOB_TABLE   = process.env.SERVICE_JOB_TABLE;
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


//GET ALL Service Job
router.get('/', (req, res) => {
    const query = "SELECT * FROM " + SERVICE_JOB_TABLE;
    pool.query(query, (error, results) =>{
      if (!results) res.json({status: "Not found!"});
      else res.json(results);
    })
  });
  
  //GET a specific Service Job by ID
  router.get('/:id', (req, res) => {
    const query = "SELECT * FROM " + SERVICE_JOB_TABLE
                + " WHERE id = ?";
    pool.query(query, [req.params.id], (error, results) =>{
      if (!results[0]) res.json({status: "Not found!"});
      else res.json(results[0]);
    })
  });
  
  
  // NEW SERVICE JOB
  router.post('/', (req, res) => {
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
    
    const query = "INSERT INTO " + SERVICE_JOB_TABLE
                + " (JobTitle, Description, BriefDescription, Category," 
                + " CustomerID, BusinessID, QuotationID, PostedDate, DueDate, CompletedDate)"
                + " values (?,?,?,?,?,?,?,?,?,?)";
    pool.query(query, Object.values(data), (error) =>{
      if (error) res.json({status: "Failure!", reason: error.code});
      else res.json({status: "success", data: data});
    })
  });
  
  
  
  // DELETE specific SERVICE JOB by ID
  router.delete('/:id', (req, res) => {
    //first check to see if there is a service job with that ID
    let query = "SELECT * FROM " + SERVICE_JOB_TABLE
              + " WHERE id = ?";
  
    pool.query(query, [req.params.id], (error, results) =>{
      //if no service job with that id could be found
      if (!results[0]) res.json({status: "Could not find a service job with that ID to delete"});
      else {
        query = "DELETE FROM " + SERVICE_JOB_TABLE 
              + " WHERE id = ?";
        pool.query(query, [req.params.id], (error, results) =>{
          if (error) res.json({status: "error", reason: error.code});
          else res.json({status: "success", reason: results});
        })
      }
    })
  });
  
  // UPDATE SERVICE JOB
  router.put('/:id', (req, res) => {
    //first check to see if there is a service job with that ID
    let query = "SELECT * FROM " +  SERVICE_JOB_TABLE
              + " WHERE id = ?";
  
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
      //if no service job with that id could be found
      if (!results[0]) res.json({status: "Could not find a service job with that ID to update"});
      else {
        //update the service job that was found
        query = "UPDATE " + SERVICE_JOB_TABLE
              + " SET JobTitle = ?, Description = ?, BriefDescription = ?,"
              + " Category = ?, CustomerID = ?, BusinessID = ?, QuotationID = ?, PostedDate = ?,"
              + " DueDate = ? "
              + " WHERE id = ?";
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
      Category:         Joi.number().positive(),
      CustomerID:       Joi.number().positive(),
      BusinessID:       Joi.number().positive(),
      QuotationID:      Joi.number().positive(),
      PostedDate:       Joi.date(),
      DueDate:          Joi.date(),
      CompletedDate:    Joi.date(),
    });
    
    return schema.validate(servicejob);
  }
  
  module.exports = router;