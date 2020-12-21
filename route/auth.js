const express = require("express");
const router=express.Router();
const createError= require("http-errors");
const bcrypt = require("bcrypt");
const User = require("../module/user");
const { signAccessToken, signRefereshToken, verfyRefreshToken} = require("../helper/jwt_helper");
const {authSchema} = require("../helper/validation");
const client = require("../helper/int_helper");

router.post("/register",async(req,res,next)=>{
    try{
        const {email,password}=req.body;
        const result = await authSchema.validateAsync(req.body);
        
        // if(!email || !password) throw createError.BadRequest();
        const doesExit= await User.findOne({email:result.email});
        if(doesExit) throw createError.Conflict(email+" is already exite.")
        const user= new User(result);
        const saveer =await user.save();
        if(!saveer) throw createError.BadRequest();
        const accesToken= await signAccessToken(saveer.id);
        const referseToken = await signRefereshToken( saveer.id)
        res.send({accesToken, referseToken});
    }
    catch(error){
        if(error.isJoi) error.status=422;
        next(error)
    }
 
});




router.post("/signin", async ( req, res, next )=>{
    try{
        const result = await authSchema.validateAsync(req.body);
        const doExit = await User.findOne({email:result.email});
        if(!doExit) throw  createError.NotFound("User not registered.")
       
       const isMatch=await bcrypt.compare(result.password,doExit.password)
       if(!isMatch) throw createError.Unauthorized('User and password is not valide.');

       const accessToken = await signAccessToken(doExit.id);
       const referseToken = await signRefereshToken( doExit.id)
       res.send({ accessToken, referseToken});

    }catch(error){
        if(error.isJoi) return next(createError.BadRequest("Invalide Username and password."))
       next(error) 
    }
})



router.delete("/logout",async (req, res, next)=>{
    try{
const {referseToken} = req.body;
if(!referseToken) throw createError.BadRequest()
const userId = await verfyRefreshToken(referseToken)
        client.DEL(userId, (err, val)=>{
            if(err){ 
                console.log(err.message);
                throw createError.InternalServerError()
            }
            console.log(val);
            res.status(204).send("Logout successful.")
        })
    }
    catch(error){
        next(error)
    }
})




router.post("/referse-token", async ( req, res, next)=>{
    try{
        const { refresToken} = req.body;
       
        if(!refresToken) throw createError.BadRequest()
        const userId = await verfyRefreshToken(refresToken);

        const accessToken = await signAccessToken( userId);
        const refer = await signRefereshToken( userId)
        res.send({accessToken, refer})
    } catch(error){
        next(error)
    }
  
})

module.exports=router;