const mongoose = require('mongoose')
const product = require('./productsModal')

const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
        productId: {
          type: ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          default: 1
        },
        productPrice: {
          type: Number,
          required: true
        },
        totalPrice: {
          type: Number,
          default: 0
        },
        status: {
          type: String,
          default: "placed"
        },
        cancelReason: {
          type: String,
          default: "none"
        }
      
    }

  ]
})

module.exports = mongoose.model('Cart',cartSchema)