const Banner = require('../model/bannerModal')

const loadBanner = async (req,res)=>{
  try {
    const banners = await Banner.find({})
    res.render('banner',{banners})
  } catch (error) {
    console.log(error.message);
  }
}

const loadAddBanner = async (req,res)=>{
  try {
    res.render('addBanner')
  } catch (error) {
    console.log(error.message);
  }
}

const addBanner = async (req,res)=>{
  try {
    const banner = new Banner({
      title:req.body.title,
      description:req.body.description,
      targetUrl:req.body.Targeturl,
      image:req.file.filename
    })
    await banner.save()
    res.redirect('/admin/banners')
  } catch (error) {
    console.log(error.message);
  }
}

const loadEditBanner = async (req,res)=>{
  try {
    const bannerId = req.query.id
    const banner = await Banner.findOne({_id:bannerId})
    res.render('editBanner',{banner})
  } catch (error) {
    console.log(error.message);
  }
}

const editBanner = async (req,res)=>{
  try {
    console.log(req.body);
    const bannerId = req.body.id;
    const banner = await Banner.findOne({_id:bannerId})
    const image = req.file ? req.file.filename : banner.image
    await Banner.findByIdAndUpdate({_id:bannerId},{
      $set:{
        title:req.body.title,
        description:req.body.description,
        targetUrl:req.body.targetUrl,
        image:image
      }
    })
    res.redirect('/admin/banners')
  } catch (error) {
    console.log(error.message);
  }
}

const listBanner = async(req,res)=>{
  try {
    const {bannerId} = req.body
    const banner = await Banner.findOne({_id:bannerId})
    if(banner.isBlocked){
      await Banner.findByIdAndUpdate({_id:bannerId},{$set:{isBlocked:false}})
    }else{
      await Banner.findByIdAndUpdate({_id:bannerId},{$set:{isBlocked:true}})
    }
    res.json({changed:true})

  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  loadBanner,
  loadAddBanner,
  addBanner,
  loadEditBanner,
  editBanner,
  listBanner
}