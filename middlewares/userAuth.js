 const isLogin = async(req,res,next)=>{
  try {
    if(req.session.user){
      res.redirect('/')
    }else{
      next()
    }
  } 
  catch (error) {
    console.log(error.message);
  }
 }

 const isLogout = async(req,res)=>{
  try {
    if(req.session.user){
      next()
    }else{
      redirect('/')
    }
  } catch (error) {
    console.log(error.message);
  }
 }

 module.exports={
  isLogin,
  isLogout
 }