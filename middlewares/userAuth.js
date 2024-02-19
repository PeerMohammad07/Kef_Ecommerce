 const isLogin = async(req,res,next)=>{
  try {
    if(req.session.user){
      res.redirect('/')
    }else{
      res.redirect('/login')
    }
  } 
  catch (error) {
    console.log(error.message);
  }
 }

 const isLogout = async(req,res,next)=>{
  try {
    if(!req.session.user){
      res.redirect('/login')
    }else{
      next()
    }
  } catch (error) {
    console.log(error.message);
  }
 }

 module.exports={
  isLogin,
  isLogout
 }