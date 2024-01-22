const mongoose= require('mongoose')
let ObjectId = mongoose.Schema.Types.ObjectId
const TokenSchema = mongoose.Schema({
  Token :{
    type:String,
    required : true
  },
  userId : {
    type:ObjectId,
    ref:'User',
    required: true
  },
  createdAt:{
    type:Date,
    default:Date.now
  }
})
TokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });
module.exports = mongoose.model('Token',TokenSchema)