const server = require('express').Router();
const { User, Role, Buy, Op, Category} = require('../../db');



server.get("/id/:id", async function(req, res, next){
    try {
        const { id } = req.params;
        let user;
        if(isNaN(id)){
            user = await User.findOne({
                where:{
                    id:id
                }, include: [
                    Role,
                    Buy,
                    {
                        model: Category ,
                        attributes: ["name"],
                        through:{
                            attributes: [],
                        }
                    },
                ]

            })
        }
        res.send(user ? user : "No hay usuario!!")
        
    } catch (error) {
        console.log(error);
    }

})



module.exports = server;