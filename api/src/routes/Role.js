const server = require('express').Router();
const { Role } = require('../db');

server.get("/", async function(req, res, next){
    try {
        const roles = await Role.findAll({
        });
        res.json({ success: true, data: roles });
    } catch (error) {
        console.log(error);
    }
})
 

module.exports = server;