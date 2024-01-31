const User = require("../model/userModel")
const bcrypt = require("bcrypt")
const Order = require('../model/orderModal')
const product = require("../model/productsModal")

// loading admin LOgin 
const AdminLogin = async (req,res)=>{
  try {
    res.render('adminLogin')
  } catch (error) {
    console.log(error.message);
  }
}


// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Inserting admin>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const insertAdmin = async (req,res)=>{
  try {
    const email = req.body.email
    const pas = req.body.password
    const admin = await User.findOne({email :email})
    if(admin){
      if(admin.is_admin){
        const pass = await bcrypt.compare(pas,admin.password)
        if(pass){
          req.session.admin = {
            _id:admin._id,
            email:admin.email,
            name:admin.name
          }
          res.redirect("/admin/dashboard")
        }else{
         req.flash('error','incorrect password')
          res.redirect('/admin/')
        }
      }else{
        req.flash('error','you are not admin')
        res.redirect('/admin/')
      }
    }else{
      req.flash('error',"you are not registered")
      res.redirect('/admin/')
    }
  } catch (error) {
    console.log(error.message);
  }
}




// admin Logout
const Adminlogout = async(req,res)=>{
  try {
    console.log(req.session.admin,"hlo");
    req.session.admin=false
    res.redirect('/admin')
  } catch (error) {
    console.log(error.message);
  }
}


const userManagementsystem = async (req,res)=>{
  try {
    let page =1;
    if(req.query.id){
      page=req.query.id
    }
    let limit = 6;
    let next = page+1;
    let previous = page>1 ? page-1 : 1

    const count  = await User.find({
      is_admin:0
    }).count()

   let totalPages = Math.ceil(count/limit)
   if(next>totalPages){
    next=totalPages
   } 

    const user = await User.find({
      is_admin:0,
      
    }).limit(limit)
    .skip((page-1)*limit)
    .exec()

      res.render('userms',{users:user,
        page:page,
        previous:previous,
        next:next,
        totalPages:totalPages
      })
  } catch (error) {
    console.log(error.message);
  }
}


const loadDashboard = async (req,res)=>{
  try {
    res.render('adminDashboard')
  } catch (error) {
    console.log(error.message);
  }
}

const blockUser = async (req,res)=>{

  try {
    const id = req.body.id;
    let user = await User.findOne({_id:id})
    if(user.Blocked){
      await User.updateOne({_id:id},{$set:{Blocked:false}})
    }else{
      await User.updateOne({_id:id},{$set:{Blocked:true}})
    }
     res.json({block:true})
  } catch (error) {
    console.log(error.message);
  }
}

const loadOrder  = async(req,res)=>{
  try {
    const order = await Order.find({})
    .populate('userId')
    .populate('products.productId')
    .sort({date:-1})
    res.render('adminOrders',{order:order})
  } catch (error) {
    console.log(error.message);
  }
}

const singleProductView = async(req,res)=>{
  try {
    const orderId = req.query.orderId
    const order = await Order.findOne({_id:orderId}).populate('userId').populate('products.productId')
    res.render('singleOrderDetails',{order:order})
  } catch (error) {
    console.log(error.message);
  }
}

const changeOrderStatus = async(req,res)=>{
  try {
   const {orderId,productId,status,userId} = req.body;
console.log(orderId,productId,status,userId);
    const orderData = await Order.findOneAndUpdate({_id:orderId,userId:userId,'products.productId':productId},{$set:{'products.$.status':status}})
    console.log(orderData,'update');
    res.json({change:true})

  } catch (error) {
    console.log(error.message);
  }
}

const cancelOrder = async(req,res)=>{
try {
  const { orderId, productId } = req.body;

  const orderData = await Order.findOneAndUpdate(
    { _id: orderId, 'products.productId': productId },
    { $set: { 'products.$.status': 'cancelled' } })
  const productDetails = await Order.findOne(
    { _id: orderId, 'products.productId': productId },
    { 'products.$': 1 }
  );

  const productQty = productDetails.products[0].quantity;

  await product.updateOne({ _id: productId }, { $inc: { stock: productQty } })
  res.json({ cancel: true })
} catch (error) {
  console.log(error.message);
}
}

module.exports= {
  AdminLogin,
  insertAdmin,
  Adminlogout,
  userManagementsystem,
  loadDashboard,
  blockUser,
  loadOrder,
  singleProductView,
  changeOrderStatus,
  cancelOrder
}