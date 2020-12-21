const jwt= require("jsonwebtoken");
const createError= require("http-errors");
require("dotenv").config();
const client = require("./int_helper");

module.exports={
    signAccessToken: (userid)=>{
        return new Promise((resolve, reject)=>{
            const paylode= {
                name:"Your trust.",
                iss:"picker.com"
            }
            const securet=process.env.ACCESS_TOKEN
            const options = {
                expiresIn:'35s',
                audience:userid
            };
            jwt.sign(paylode, securet, options, (err, token)=>{
                if(err) return reject(err);
                resolve(token);
            })
        })
    },

    verifyToken:(req,res,next)=>{
        if(!req.headers['authorization']) return next(createError.Unauthorized())
        const token = req.headers['authorization'].split(' ')[1]
        jwt.verify(token,process.env.ACCESS_TOKEN, (err, payload)=>{
            if(err) {
                if(err.name==="TokenExpiredError"){
                    return next(createError.Unauthorized()) 
                } else{
                    return next(createError.Unauthorized("You need to logIn"))
                }
                
            }
            req.payload=payload
            next()
        })
    },

    signRefereshToken: (userid)=>{
        return new Promise((resolve, reject)=>{
            const paylode= {
                name:"Your trust.",
                iss:"picker.com"
            }
            const securet=process.env.REFERSE_TOKEN
            const options = {
                expiresIn:'1y',
                audience:userid
            };
            jwt.sign(paylode, securet, options, (err, token)=>{
                if(err) return reject(err);
                client.SET(userid, token, 'EX', 365 * 24 * 60 * 60, (err,replay)=>{
                    if(err) {
                        console.log(err);
                         reject(createError.InternalServerError())
                        }
                        resolve(token);
                })
                
            })
        })
    },

    verfyRefreshToken: (refreshToken)=>{
        
        return new Promise((resolve, reject)=>{
            jwt.verify(refreshToken, process.env.REFERSE_TOKEN, (err,payload)=>{
                if(err) return reject(createError.Unauthorized()) 
                const userId=payload.aud
                client.GET(userId,(err, result)=>{
                    if(err){
                        console.log(err);
                        reject(createError.InternalServerError())
                        return
                    }
                    if(refreshToken === result) return resolve(userId)
                    reject(createError.Unauthorized())
                })
            
            
          
            })
            
        })
    }
}