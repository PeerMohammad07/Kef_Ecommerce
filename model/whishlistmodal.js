const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.Types.ObjectId

const whishlistSchema = mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  productId :{
    type:ObjectId,
    ref:'Product',
    required:true
  }
})

module.exports = mongoose.model('Whishlist',whishlistSchema)
