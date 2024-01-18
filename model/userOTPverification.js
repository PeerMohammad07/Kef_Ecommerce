const mongoose = require("mongoose")

const userOtpVerificationSchema = mongoose.Schema({
    email :{
      type:String
    },
    otp :{
      type :String
    },
    createdAt :{
      type: Date,
        default: Date.now,
    }
})

const userVerification = mongoose.model('userOtpVerification',userOtpVerificationSchema)

module.exports = userVerification;