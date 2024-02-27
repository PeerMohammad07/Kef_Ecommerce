const Banner = require('../model/bannerModal')

const loadBanner = async (req,res)=>{
  try {
    let page = 1;
    if(req.query.id){
      page = req.query.id
    }
    let next = page+1
    let previous = page>1?page-1:1
    let limit = 6;

    const count =  await Banner.find({}).count()

    const totalPages = Math.ceil(count/limit)

    if(next > totalPages){
      next = totalPages
    }


    const banners = await Banner.find({}).limit(limit).skip((page -1)*limit).exec()
    res.render('banner',{banners,next,previous,totalPages})
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
    const already = await Banner.findOne({title:req.body.title})
if(!already){
  const banner = new Banner({
    title:req.body.title,
    description:req.body.description,
    targetUrl:req.body.Targeturl,
    image:req.file.filename
  })
  await banner.save()
  res.redirect('/admin/banners')
}else{
  req.flash('exists','title is already exists')
  res.redirect('/admin/addBanner')
}
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
    const already = await Banner.findOne({title:req.body.title,_id:{$ne:req.body.id}})
    const bannerId = req.body.id;
    const banner = await Banner.findOne({_id:bannerId})
    const image = req.file ? req.file.filename : banner.image

    if(!already){
    await Banner.findByIdAndUpdate({_id:bannerId},{
      $set:{
        title:req.body.title,
        description:req.body.description,
        targetUrl:req.body.Targeturl,
        image:image
      }
    })
    res.redirect('/admin/banners')
  }else{
    req.flash('exists','title already exists')
    res.redirect(`/admin/editBanner?id=${bannerId}`)
  }
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