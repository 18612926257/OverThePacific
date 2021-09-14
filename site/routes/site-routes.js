// Setup express router
const express = require("express");
const router = express.Router();

// Access to DAO files
const restaurantsDAO = require("../modules/restaurantsDAO.js");

const path = require("path");
const fs = require("fs");


// Route handlers

//Home page load added by Cara
router.get("/", async function(req,res){
    // Get all restaurants
    const restaurants = await restaurantsDAO.getAllRestaurants();
    //console.log(restaurants)
    res.locals.restaurants = restaurants;
    
    res.render("main");
});


// Search functionality
router.post("/", async function (req, res) {
    
    const query = req.body.search
    const restaurants = await restaurantsDAO.getSearchedRestaurants(query);
    res.locals.restaurants = restaurants;
    
    res.render("main");
});



module.exports = router;