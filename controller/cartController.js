const User = require('../model/userModel')
const Product = require('../model/productsModal')
const Cart = require('../model/cartModal')


const addToCart = async (req, res) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      return res.json({ login: true, message: 'please login and continuing shopiing' })
    } else {
      const userid = req.session.user._id
      const { productQuantity, productId } = req.body
      const product = await Product.findOne({ _id: productId })
      const cart = await Cart.findOne({ userId: userid })
      if (cart) {
        const existProduct = cart.products.find((pro) => pro.productId == productId)
        if (existProduct) {
          await Cart.findOneAndUpdate({ userId: userid, "products.productId": productId },
            { $inc: { "products.$.quantity": productQuantity, "products.$.totalPrice": productQuantity * existProduct.productPrice } })
        } else {
           await Cart.findOneAndUpdate(
            { userId: userid },
            {
              $push:{
              products:{
                  productId: productId,
                  quantity: productQuantity,
                  productPrice: product.price,
                  totalPrice: productQuantity * product.price
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

const loadCart = async (req,res)=>{
  try {
   
    if(!req.session.user||!req.session.user._id){
      req.flash('error','please Login then only service')
      res.redirect('/login')
    }else{
      const userid = req.session.user._id
      const cartDetails = await Cart.findOne({userId:userid}).populate({path:'products.productId'}).exec()
      res.render('cart',{cartDetails: cartDetails})
    }
  } catch (error) {
    console.log(error);
  }
}

const removeCart = async (req,res)=>{
  try {
    const userId = req.session.user._id
    const productId = req.body.product
    const userCart = await Cart.findOne({userId:userId})
    if(userCart){
      await Cart.findOneAndUpdate(
        {
          userId:userId
        },{
          $pull:{products:{productId:productId}}
        }
      )
    }
    res.json({success:true})
  } catch (error) {
    console.log(error.message);
  }
}



module.exports = {
  addToCart,
  loadCart,
  removeCart

}