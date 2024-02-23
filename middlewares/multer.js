const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination : (req,file,cb)=>{
    cb(null,path.join(__dirname,'../public/assets/images/product/productimages'))
  },
  filename : function(req,file,cb){
    const name = Date.now()+'-'+file.originalname;
    cb(null,name,)
  }
})


const bannerStorage = multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null,path.join(__dirname,'../public/assets/images/banner'))
  },
  filename:(req,file,cb)=>{
    const filename = file.originalname
    cb(null,filename)
  }
})

const upload = multer({storage : storage})
const uploadBanner = multer({storage:bannerStorage})

module.exports = {
  upload,
  uploadBanner
}
 





