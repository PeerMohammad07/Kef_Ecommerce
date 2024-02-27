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
    city:{
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
  },
  wallet:{
    type:Number,
    default:0
  },
  referId:{
    type:Number
  },
  walletHistory :[
    {
      amount:{
        type:Number,
        default:0
      },
      date:{
        type : Date
      }
    }
  ]
})

module.exports = mongoose.model("User", userschema)