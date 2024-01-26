const Cart = require('../model/cartModal')
const User = require('../model/userModel')
const Order = require('../model/orderModal')
const Product = require('../model/productsModal')

const placeOrder = async(req,res)=>{
  try {
    const {
      index,
      payment,
      subTotal
    } = req.body;
    const userid = req.session.user._id;
    const cart = await Cart.findOne({userId:userid}).populate('products.productId')
    const products = cart.products;
    console.log(products);
    const user = await User.findOne({_id:userid})
    const status = payment == 'COD'?'placed':'pending'
    const address = user.addresses[index]
    const date = Date.now()
    const order =  new Order({
      userId:userid,
      products:products,
      totalAmount:subTotal,
      date:date,
      status:status,
      deliveryAddress:address,
      paymentMethod:payment
    })
   const oderDetails = await order.save()
   const orderId = oderDetails._id;
    if(oderDetails.status=='placed'){
      await Cart.deleteOne({userId:userid})
      for(let i =0;i<products.length;i++){

        const productId = products[i].productId;
        const productQuantity = products[i].quantity;
        await Product.updateOne({_id:productId},{$inc:{stock:-productQuantity}})
      }
    }
    res.json({success:true,orderId})
  } catch (error) {
    console.log(error);
  }
}


const loadOrderSuccess = async(req,res)=>{
  try {
    const orderId =req.params.id 
    console.log("getting params ",orderId);
    res.render('orderSuccess',{orderId})
  } catch (error) {
    console.log(error.message);
  }
}

const orderDetails = async(req,res)=>{
  try {
    const orderId = req.query.id
    const orderDetails = await Order.findOne({_id:orderId}).populate('products.productId')
    res.render('orderDetails',{orderDetails})
  } catch (error) {
    console.log(error.message);
  }
}

const loadMyOrder = async(req,res)=>{
  try {
    const userid = req.session.user._id
    const orders = await Order.find({userId:userid}).populate('products.productId')
    console.log(orders);
    res.render('myOrders',{orders})
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  placeOrder,
  loadOrderSuccess,
  orderDetails,
  loadMyOrder
}