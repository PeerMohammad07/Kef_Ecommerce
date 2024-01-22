const mongoose = require("mongoose")

const userschema = new mongoose.Schema({
  name :{
    type : String,
    required:true   
  },
  email:{
    type : String,
    required:true
  },
  mobile :{
    type: String,
    required:true
  },
  password :{
    type: String,
    required:true
  },
  addresses:[
    {
      name :{
      type:String,
    },
    state:{
      type:String
    },
    country:{
      type:String
    },
    pinNo:{
      type:Number
    },
    phNo:{
      type:Number
    }
    }   
  ],
  is_admin :{
    type : Number,
    default:0
  },
  Blocked :{
    type:Boolean,
    default:false
  },
  verified :{
    type : Boolean,
   
  }
})

module.exports = mongoose.model("User", userschema)