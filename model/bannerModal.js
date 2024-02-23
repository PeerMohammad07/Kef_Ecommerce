const mongoose = require('mongoose')

const bannerSchema = mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  image:{
    type:String,
    required:true
  },
  targetUrl:{
    type:String,
    required:true
  },
  isBlocked:{
    type:Boolean,
    default:false
  }
})

module.exports = mongoose.model('Banner',bannerSchema)