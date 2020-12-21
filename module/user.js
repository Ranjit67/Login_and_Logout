const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema= mongoose.Schema({
    email:{
        require:true,
        type:String,
        lowerCase:true
    },
    password:{
        require:true,
        type:String
        }
})

UserSchema.pre("save", async function(next){
try{
const salt = await bcrypt.genSalt(10);
const hashPassword= await bcrypt.hash(this.password,salt);
this.password= hashPassword;
next();
} catch(error){
    next(error)
}
})

UserSchema.methods.isValidPassword = async function(password){
    try{
        return await bcrypt.compare(password,this.password)
    } catch(error){
        throw error
    }
}



module.exports= mongoose.model("user",UserSchema)