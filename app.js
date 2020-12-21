const express= require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const mongoose= require("mongoose");
require('dotenv').config();
const {verifyToken} = require("./helper/jwt_helper");
require('./helper/int_helper');



const app=express();

app.use(morgan("dev"))
app.use(express.json());


mongoose.connect(process.env.MONGO_DB,{useNewUrlParser: true ,useUnifiedTopology: true });

mongoose.connection.on("connected",()=>{
    console.log("The data base is connected.");
})
mongoose.connection.on("error",(err)=>{
    console.log(err);
})

//roue route
app.get("/route", verifyToken, (req,res, next)=>{
    res.send("This is the home route.");
    })

const Auth= require("./route/auth.js");
app.use("/auth",Auth);

app.use(async(req,res,next)=>{
    next(createError.NotFound())
})

app.use((err,req,res,next)=>{
res.status(err.status || 500);
res.send({
    error:{
        status:err.status || 500,
        message:err.message
    }
})
})




app.listen(9000,()=>{
    console.log("The port is runing in 9000....");
});