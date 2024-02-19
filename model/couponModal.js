const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({
  name :{
    type:String,
    required:true
  },
  couponCode:{
    type:String,
    required:true
  },
  activationDate:{
    type:Date,
    required:true
  },
  expiryDate:{
    type:Date,
    required:true
  },
  limitOfUse:{
    type:Number,
    required:true
  },
  discountAmount:{
    type:Number,
    required:true
  },
  status:{
    type:Boolean,
    default:false
  },
  userUsed:{
    type:Array,
    ref:'User',
    default:[]
  }
})

module.exports = mongoose.model('Coupon',couponSchema)
