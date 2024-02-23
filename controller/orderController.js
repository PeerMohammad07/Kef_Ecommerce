const Cart = require('../model/cartModal')
const User = require('../model/userModel')
const Order = require('../model/orderModal')
const Product = require('../model/productsModal')
const Razorpay = require('razorpay');
const product = require('../model/productsModal');
const Coupon = require('../model/couponModal')
const crypto = require('crypto')

var instance = new Razorpay({
  key_id: 'rzp_test_LoOWJkhlCEPQCp',
  key_secret: 'RoKLB9O83abv125T0hrpSIA0',
});

const placeOrder = async (req, res) => {
  try {
    const {
      index,
      payment,
      subTotal,
      couponCode
    } = req.body;

    const userid = req.session.user._id;
    const cart = await Cart.findOne({ userId: userid }).populate('products.productId')
    const products = cart.products;
    let quantityLess = 0;
    const quancheck = products.forEach((pro) => {
      if (pro.productId.stock <= 0) {
        quantityLess = pro.productId.name;
      }

    })

    if (quantityLess) {
      res.json({ quan: true, quantityLess })
    } else {
      const user = await User.findOne({ _id: userid })
      const status = payment == 'COD' ? 'placed' : 'pending'
      const address = user.addresses[index]
      const date = Date.now()
      const order = new Order({
        userId: userid,
        products: products,
        totalAmount: subTotal,
        date: date,
        status: status,
        deliveryAddress: address,
        paymentMethod: payment,
      })
      const oderDetails = await order.save()
      const orderId = oderDetails._id;

      const coupon = await Coupon.findOne({couponCode:couponCode})
      if(coupon){
        coupon.userUsed.push({userId:userid})
        await coupon.save()
        let discount = 0;
        const disc = coupon.discountAmount/cart.products.length
        discount = Math.round(disc)
        await Order.findByIdAndUpdate({_id:orderId},{$set:{couponApplied:discount}})
      }

      //if the payment is cod
      if (oderDetails.status == 'placed') {
        await Cart.deleteOne({ userId: userid })
        for (let i = 0; i < products.length; i++) {
          const productId = products[i].productId;
          const productQuantity = products[i].quantity;
          await Product.updateOne({ _id: productId }, { $inc: { stock: -productQuantity } })
        }
        res.json({ success: true, orderId })
      }

      //if the payment is wallet
      if(oderDetails.paymentMethod == 'wallet'){
      const user = await User.findOne({_id:userid})
      if(user.wallet >= subTotal){
        const data = {
          amount : subTotal,
          date: new Date()
        }
        await User.findByIdAndUpdate({_id:userid},{$inc:{wallet:-subTotal}, $push: { walletHistory: data }})
        await Order.findOneAndUpdate({userId:userid},{$set:{status:"placed"}})
        await Cart.deleteOne({userId:userid})
        for (let i = 0; i < products.length; i++) {
          const productId = products[i].productId;
          const productQuantity = products[i].quantity;
          await Product.updateOne({ _id: productId }, { $inc: { stock: -productQuantity } })
        }
        res.json({wallet:true,orderId})
      }else{
        res.json({money:true})
      }
      }

      // if the payment is razorpay
      else if (oderDetails.status == 'pending') {
        const options = {
          amount: subTotal * 100,
          currency: "INR",
          receipt: "" + oderDetails._id,
        }
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.log(err);
          }
          res.json({ order })
        })
      }

    }
  } catch (error) {
    console.log(error);
  }
}


const loadOrderSuccess = async (req, res) => {
  try {
    const orderId = req.params.id
    res.render('orderSuccess', { orderId })
  } catch (error) {
    console.log(error.message);
  }
}

const orderDetails = async (req, res) => {
  try {
    const orderId = req.query.id
    const orderDetails = await Order.findOne({ _id: orderId }).populate('products.productId')
    res.render('orderDetails', { orderDetails })
  } catch (error) {
    console.log(error.message);
  }
}

const loadMyOrder = async (req, res) => {
  try {
    const userid = req.session.user._id
    const orders = await Order.find({ userId: userid }).populate('products.productId').sort({date:-1})
    res.render('myOrders', { orders })
  } catch (error) {
    console.log(error.message);
  }
}

const cancelOrder = async (req, res) => {
  try {
    const { orderId, productId } = req.body;
    const userId = req.session.user?._id

     const orderDetails = await Order.findOneAndUpdate(
      { _id: orderId, 'products.productId': productId },
      { $set: { 'products.$.status': 'cancelled' } })

    const productDetails = await Order.findOne(
      { _id: orderId, 'products.productId': productId },
      { 'products.$': 1 }
    ).populate('products.productId')


      const total = orderDetails.couponApplied? productDetails.products[0].productId.price * productDetails.products[0].quantity - orderDetails.couponApplied : productDetails.products[0].productId.price * productDetails.products[0].quantity
      console.log(total);
    
    if(orderDetails.paymentMethod == 'razorpay' || orderDetails.paymentMethod == 'wallet'){
      const user  = await User.findOne({_id:userId})
      user.wallet += total
      const data = {
        amount: total,
        date: new Date()
      }
      user.walletHistory.push(data)
      user.save()
    }

    const productQty = productDetails.products[0].quantity;
    await Product.updateOne({ _id: productId }, { $inc: { stock: productQty } })

    res.json({ cancel: true })

  } catch (error) {
    console.log(error.message);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { payment, order } = req.body;
    const userId = req.session.user?._id
    const hmac = crypto.createHmac("sha256", process.env.razorpay_SECRET);
    hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id);
    const hmacValue = hmac.digest("hex");
    if (hmacValue === payment.razorpay_signature) {
      const cart = await Cart.findOne({ userId: userId }).populate("products.productId")
      const products = cart.products;

      for (let i = 0; i < products.length; i++) {
        let productId = products[i].productId;
        const productQty = products[i].quantity;
        await Product.findOneAndUpdate({ _id: productId }, { $inc: { stock: -productQty } })
      }
      await Order.findOneAndUpdate({ _id: order.receipt }, { $set: { status: "placed", paymentId: payment.razorpay_payment_id } })

      await Cart.deleteOne({ userId: userId })
      res.json({ paymentSuccess: true })
    }
  } catch (error) {
    console.log(error);
  }
}

const returnRequest = async(req,res)=>{
  try {
    const {orderId,productId,reason}=req.body;
    const userid = req.session.user?._id
    if(userid){
      await Order.findOneAndUpdate({_id:orderId,'products.productId':productId},
      {'products.$.returnReason':reason,
       'products.$.status':'returnRequested'
      })
      res.json({Return:true})
    }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  placeOrder,
  loadOrderSuccess,
  orderDetails,
  loadMyOrder,
  cancelOrder,
  verifyPayment,
  returnRequest
}