const User = require('../model/userModel')
const Product = require('../model/productsModal')
const Cart = require('../model/cartModal')
const Whishlist = require('../model/whishlistmodal')
const product = require('../model/productsModal')
const Offer = require('../model/offerModal')

const addToCart = async (req, res) => {
  try {
    console.log(req.session.user);
    if (!req.session.user || !req.session.user._id) {
      return res.json({ login: true, message: 'please login and continuing shopiing' })
    } else {
      const userid = req.session.user._id
      const { productQuantity, productId } = req.body;
      const product = await Product.findOne({ _id: productId }).populate('offer').populate('category')
      const cart = await Cart.findOne({ userId: userid })
      let productPrice;
      if(product.offer&&!product.category.offer){
        // product offer ondenkil
        productPrice = Math.floor( product.price - (product.price * product.offer.offerPercentage /100))
      }else if(product.category.offer&&!product.offer){
        // category offer ondenkil
        const offer = await Offer.findById({_id:product.category.offer})
        productPrice = Math.floor( product.price - (product.price * offer.offerPercentage /100))
      }else if(product.category.offer&&product.offer){
        // productum category offer ndenkilum
        if(product.offer.offerPercentage>=product.category.offer.offerPercentage){
          productPrice = Math.floor( product.price - (product.price * product.offer.offerPercentage /100))
        }else if(product.category.offer.offerPercentage>product.offer.offerPercentage){
          const offer = await Offer.findById({_id:product.category.offer})
          productPrice = Math.floor( product.price - (product.price * offer.offerPercentage /100))
        }
      }else{
        productPrice =  product.price
      }

      if (cart) {
        const existProduct = cart.products.find((pro) => pro.productId == productId)
        if (existProduct) {
          await Cart.findOneAndUpdate({ userId: userid, "products.productId": productId },
            { $inc: { "products.$.quantity": productQuantity, "products.$.totalPrice": productQuantity * existProduct.productPrice } })
        } else {
          await Cart.findOneAndUpdate(
            { userId: userid },
            {
              $push: {
                products: {
                  productId: productId,
                  quantity: productQuantity,
                  productPrice: product.price,
                  totalPrice: productQuantity * productPrice
                }
              }
            })
        }
      } else {
        const newCart = new Cart({
          userId: userid,
          products: [
            {
              productId: productId,
              quantity: productQuantity,
              productPrice: product.price,
              totalPrice: productQuantity * product.price
            }

          ]
        })
        await newCart.save()
      }
      res.json({ success: true })
    }
  } catch (error) {
    console.log(error);
  }
}

const loadCart = async (req, res) => {
  try {

    if (!req.session.user || !req.session.user._id) {
      req.flash('error', 'please Login then only service')
      res.redirect('/login')
    } else {
      const userid = req.session.user._id
      const cartDetails = await Cart.findOne({ userId: userid }).populate({ path: 'products.productId' }).exec()
      res.render('cart', { cartDetails: cartDetails })
    }
  } catch (error) {
    console.log(error);
  }
}

const removeCart = async (req, res) => {
  try {
    const userId = req.session.user._id
    const productId = req.body.product
    const userCart = await Cart.findOne({ userId: userId })
    if (userCart) {
      await Cart.findOneAndUpdate(
        {
          userId: userId
        }, {
        $pull: { products: { productId: productId } }
      }
      )
    }
    res.json({ success: true })
  } catch (error) {
    console.log(error.message);
  }
}

const updateQuantity = async (req, res) => {
  const { productId, count } = req.body;
  const product = await Product.findOne({ _id: productId }).populate('category')
  const userid = req.session.user._id;
  const cart = await Cart.findOne({ userId: userid })
  if (count == -1) {
    const currentQuantity = cart.products.find((p) => p.productId == productId).quantity
    if (currentQuantity <= 1) {
      return res.json({ min: true })
    }
  }
  if (count == 1) {
    const currentQuantity = cart.products.find((prod) => prod.productId == productId).quantity
    if (currentQuantity >= product.stock) {
      return res.json({ max: true })
    }
  }
  const producPric = cart.products.find((prod) => prod.productId.toString() == productId)




  let productPrice;
  if(product.offer&&!product.category.offer){
    // product offer ondenkil
    productPrice = Math.floor( product.price - (product.price * product.offer.offerPercentage /100))
  }else if(product.category.offer&&!product.offer){
    // category offer ondenkil
    const offer = await Offer.findById({_id:product.category.offer})
    productPrice = Math.floor( product.price - (product.price * offer.offerPercentage /100))
  }else if(product.category.offer&&product.offer){
    // productum category offer ndenkilum
    if(product.offer.offerPercentage>=product.category.offer.offerPercentage){
      productPrice = Math.floor( product.price - (product.price * product.offer.offerPercentage /100))
    }else if(product.category.offer.offerPercentage>product.offer.offerPercentage){
      const offer = await Offer.findById({_id:product.category.offer})
      productPrice = Math.floor( product.price - (product.price * offer.offerPercentage /100))
    }
  }else{
    productPrice =  producPric.productPrice
  }



  await Cart.findOneAndUpdate({ userId: userid, 'products.productId': productId },
    {
      $inc:
      {
        'products.$.quantity': count,
        'products.$.totalPrice': count * productPrice
      }
    }
  )
  res.json({ success: true })
}


const addToWishlist = async (req, res) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      return res.json({ login: true, message: 'please login' })
    } else {

      const userId = req.session.user?._id
      const { productId } = req.body;
      const already = await Whishlist.findOne({ productId: productId })
      if (already) {
        res.json({ already: true })
      } else {
        const whishlist = new Whishlist({
          userId: userId,
          productId: productId
        })
        await whishlist.save()
        res.json({ added: true })
      }
    }

  } catch (error) {
    console.log(error.message);
  }
}

const loadWishList = async (req, res) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      req.flash('error', 'please Login then only service')
      res.redirect('/login')
    } else {
      const userId = req.session.user._id
      const allWishList = await Whishlist.find({ userId: userId }).populate('productId')
      res.render('whishList', { allWishList })
    }

  } catch (error) {
    console.log(error.message);
  }
}

const removeWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const remove = await Whishlist.findOneAndDelete({ productId: productId })
    res.json({ removed: true })
  } catch (error) {
    console.log(error.message);
  }
}



module.exports = {
  addToCart,
  loadCart,
  removeCart,
  updateQuantity,
  addToWishlist,
  loadWishList,
  removeWishlist
}