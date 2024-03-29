const mongoose = require('mongoose');
const product = require('./productsModal');
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = mongoose.Schema({
  userId:{
    type:ObjectId,
    ref:'User',
    required:true
  },
  products:[
    {
      productId:{
        type:ObjectId,
        ref:'Product',
        required:true
      },
      name:{
        type:String
      },
      price:{
        type:Number,
        
      },
      description:{
        type:String,
        
      },
      status :{
        type:String,
        enum: ['placed', 'outForDelivery','returnRequested','returned' ,'returnDenied','shipped', 'delivered','cancelled'],
        default:'placed'
      },
      quantity :{
        type:Number,
      },
      returnReason:{
        type:String
      }
    }
  ],
  cancelReason:{
    type:String
  },
  returnReason:{
    type:String
  },
  totalAmount:{
    type:Number,
    required:true
  },
  date:{
    type:Date,
    required:true
  },
  status:{
    type:String,
    required:true
  },
  paymentMethod:{
    type:String,
    required:true
  },
  deliveryAddress:{
    type:Object,
    required:true
  },
  paymentId:{
    type:String
  },
  couponApplied:{
    type:Number,
  }
})

module.exports = mongoose.model('Order',orderSchema)




  