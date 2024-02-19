const Coupon = require('../model/couponModal')

const loadCoupon = async (req,res)=>{
  try {
    const allCoupon = await Coupon.find()
    res.render('adminCoupon',{allCoupon:allCoupon})
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
    await Coupon.updateOne({_id:id},{$set:{
      name:name,
      activationDate:adate,
      expiryDate:edate,
      limitOfUse:limit,
      discountAmount:damount
    }})
    res.redirect('/admin/coupons')
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

module.exports = {
  loadCoupon,
  loadaddCoupon,
  addCoupon,
  loadeditCoupon,
  editCoupon,
  listCoupon
}