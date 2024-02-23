const Coupon = require('../model/couponModal')
const Cart = require('../model/cartModal')

const loadCoupon = async (req,res)=>{
  try {
    let page = 1;
    if(req.query.id){
      page = req.query.id
    }
    const limit = 6;
    let previous = page > 1?page -1 : 1
    let next = page +1

    const count = await Coupon.find({status:false}).count()
    const totalPages = Math.ceil(count/limit)
    console.log(previous);
    const allCoupon = await Coupon.find().limit(limit).skip((page-1)*limit).exec()

    res.render('adminCoupon',{allCoupon:allCoupon,totalPages:totalPages,previous:previous,next:next})
  } catch (error) {
   console.log(error.message); 
  }
}

const loadaddCoupon = async (req,res)=>{
  try {
    res.render('addCoupon')
  } catch (error) {
    console.log(error.message);
  }
}

const addCoupon = async (req,res)=>{
  try {
    const {name,adate,edate,limit,damount} = req.body
    const firstName = name.split('').splice(1,3).join('')
    const randomString = Math.random().toString(36).substring(2, 7);
    const randomNumber = `${Math.floor(1000 + Math.random() * 9000)}`;
    const existName = await Coupon.findOne({name:name})
    if(existName){
      req.flash('exists','this coupon name is already exists')
      res.redirect('/admin/addCoupon')
    }else{
      const newCoupon = new Coupon({
        name:name,
        couponCode:`${firstName}${randomString}${randomNumber}`,
        activationDate:adate,
        expiryDate:edate,
        limitOfUse:limit,
        discountAmount:damount
      })
  
      await newCoupon.save()
      res.redirect('/admin/coupons')
    }


  } catch (error) {
    console.log(error.message);
  }
}

const loadeditCoupon = async (req,res)=>{
  try {
    const id = req.query.id;
    const coupon = await Coupon.findOne({_id:id})
    res.render('editCoupon',{coupon:coupon})
  } catch (error) {
    console.log(error.message);
  }
}

const editCoupon =async (req,res)=>{
  try {
    const {id,name,adate,edate,limit,damount} = req.body;
    const already = await Coupon.findOne({ _id: { $ne: id }, name: name})
    if(already){
      req.flash('exists','this coupon name is already exists')
      res.redirect(`/admin/editCoupon?id=${id}`)
    }else{
      await Coupon.updateOne({_id:id},{$set:{
        name:name,
        activationDate:adate,
        expiryDate:edate,
        limitOfUse:limit,
        discountAmount:damount
      }})
      res.redirect('/admin/coupons')
    }
  } catch (error) {
    console.log(error.message);
  }
}

const listCoupon = async(req,res)=>{
  try {
    const id = req.body.id
    const coupon = await Coupon.findOne({_id:id})
    console.log(coupon,"hehe");
    if(coupon.status == true){
      await Coupon.findOneAndUpdate({_id:id},
        {
          $set:{
            status:false
          }
        })
    }else if(coupon.status == false){
      await Coupon.findOneAndUpdate({_id:id},
        {
          $set:{
            status:true
          }
        })
    }
    res.json({list:true})
  } catch (error) {
    console.log(error.message);
  }
}

const loadMyCoupon = async(req,res)=>{
  try {
    const coupons = await Coupon.find({})
    res.render('myCoupons',{coupons:coupons})
  } catch (error) {
    console.log(error.message);
  }
}

const checkCoupon = async (req,res)=>{
  try {
    const cCode = req.body.couponCode 
    const userId = req.session.user?._id
    const couponCode = await Coupon.findOne({couponCode:cCode})
    const cartData = await Cart.findOne({userId:userId})
   
    if(couponCode){
        const alreadyUsed = couponCode.userUsed.find((user)=> user.userId === userId)
          if(!alreadyUsed){
            let currentDate = new Date()
            if(couponCode.expiryDate > currentDate){
              const total = cartData.products.reduce((acc,value)=> acc+= value.totalPrice,0)
              if(total >= couponCode.limitOfUse){
                let discount = 0;
                let cartAmount =0;
                if(couponCode.discountAmount){
                  const dics = couponCode.discountAmount/cartData.products.length
                  discount = Math.round(dics)
                   cartAmount = cartData.products.reduce((acc,value)=>{
                    if(value.totalPrice >= discount){
                      return acc += (value.totalPrice - discount)
                    }else{
                      return acc += value.totalPrice
                    }
                  },0)
                }
                res.json({success:true,subTotal:cartAmount})
              }else{
                res.json({min:true,message:'minimum amount needed'})
              }
            }else{
              res.json({expired:true,message:'this coupon is expired'})
            }
          }else{
            res.json({alreadyUsed:true,message:'this coupon already used'})
          }
    }else{
      res.json({notAvailable:true,message:'coupon is not available '})
    }
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  loadCoupon,
  loadaddCoupon,
  addCoupon,
  loadeditCoupon,
  editCoupon,
  listCoupon,
  loadMyCoupon,
  checkCoupon
}