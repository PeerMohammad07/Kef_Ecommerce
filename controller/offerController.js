const Offer = require('../model/offerModal')
const Product = require('../model/productsModal')
const Category = require('../model/categoryModal')
const { exists } = require('../model/userModel')

const loadOffer = async (req,res)=>{
  try {
    const offers = await Offer.find({})
    res.render('offerManagement',{offers})
  } catch (error) {
    console.log(error.message);
  }
}

const loadAddOffer = async (req,res) =>{
  try {
    res.render('addOffer')
  } catch (error) {
    console.log(error.message);
  }
}

const addOffer = async (req,res)=>{
  try {
    const already = await Offer.findOne({name:req.body.name})
    if(!already){
      const offer = new Offer({
        name:req.body.name,
        expiryDate:req.body.edate,
        offerPercentage:req.body.off
      })
      await offer.save()
      res.redirect('/admin/offers')
    }else{
      req.flash('exists','already used this offer name')
      res.redirect('/admin/offers')
    }
  } catch (error) {
    console.log(error.message);
  }
}

const loadEditOffer = async (req,res)=>{
  try {
    const offerId = req.query.id
    const offer = await Offer.findOne({_id:offerId})
    res.render('editOffer',{offer})
  } catch (error) {
    console.log(error.message);
  }
}

const editOffer = async (req,res)=>{
  try {
    const already = await Offer.findOne({name:req.body.name,_id:{$ne:req.body.id}})
    const offerId = req.body.id
    if(!already){
      await Offer.findByIdAndUpdate({_id:offerId},
        {
          name:req.body.name,
          expiryDate:req.body.edate,
          offerPercentage:req.body.off
        })
        res.redirect('/admin/offers')
    }else{
      req.flash('exists','this Offer name is already exists')
      res.redirect(`/admin/editOffer?id=${offerId}`)
    }
  } catch (error) {
    console.log(error.message);
  }
}

const addProductOffer = async (req,res)=>{
  try {
    const {offer,product} = req.body;
    const offerId = offer;
    const off = await Offer.findOne({_id:offerId})
    const currentDate = new Date()
    if(off.expiryDate>currentDate){
   await Product.findByIdAndUpdate(
      {_id:product},
      {
        $set:{
          offer:offerId
        }
      }
    )
    res.json({success:true})
    }else{
      req.flash('expired','this offer expired')
      res.redirect(`/admin/applyOffer?id=${offer}`)
    }
  } catch (error) {
    console.log(error.message);
  }
}

const loadApplyOffer = async (req,res)=>{
  try {
    const productId = req.query.id
    const product = await Product.findOne({_id:productId})
    const offers = await Offer.find({})
    res.render('offerApply',{offers,productId,product})
  } catch (error) {
    console.log(error.message);
  }
}

const removeProductOffer = async (req,res)=>{
  try {
    const {offerId,productId} = req.body
    await Product.findByIdAndUpdate(
      {_id:productId},
      {$unset:{offer:''}}
    )
    res.json({success:true})
  } catch (error) {
    console.log(error.message);
  }
}

const loadApplyOfferCategory = async (req,res)=>{
  try {
    const categoryId = req.query.id
    const category = await Category.find({_id:categoryId})
    const offers = await Offer.find({})
    res.render('applyCategoryOffer',{offers,categoryId,category})
  } catch (error) {
    console.log(error.message);
  }
}

const addCategoryOffer = async (req,res)=>{
  try {
    const {offerId,categoryId} = req.body;
    const offer = await Offer.findOne({_id:offerId})
    const currentDate = new Date()
    if(currentDate<=offer.expiryDate){
      await Category.findByIdAndUpdate(
        {_id:categoryId},
        {
          $set:{
            offer:offerId
          }
        }
      )
      res.json({success:true})
    }else{
      req.flash('expired','offer expired')
      res.redirect(`/admin/applyCategoryOffer?id=${categoryId}`)
    }
  } catch (error) {
    console.log(error.message);
  }
}

const removeCategoryOffer = async(req,res)=>{
  try {
    const {offerId,categoryId} = req.body
    await Category.findByIdAndUpdate(
      {_id:categoryId},
      {$unset:{offer:''}}
    )
    res.json({success:true})
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  loadOffer,
  loadAddOffer,
  addOffer,
  loadEditOffer,
  editOffer,
  addProductOffer,
  loadApplyOffer,
  removeProductOffer,
  loadApplyOfferCategory,
  addCategoryOffer,
  removeCategoryOffer
}