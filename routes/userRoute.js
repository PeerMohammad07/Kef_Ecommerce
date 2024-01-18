const express = require("express")
const user_route = express()
const config = require('../configuration/config')
const User = require("../model/userModel")
const userController = require("../controller/userController")
const auth = require('../middlewares/userAuth')
const productController = require('../controller/productController')
//session
const session = require("express-session")
user_route.use(session({secret:config.sessionsecret,resave:false,saveUninitialized:false}))

user_route.use((req,res,next)=>{
  res.locals.user = req.session.user||null;
  res.locals.LoggedIn = req.session.user ? true:false;
  next()
})

user_route.use(express.json())
user_route.use( express.urlencoded({extended : true}))

//view engine
user_route.set('view engine','ejs')
user_route.set('views','./view/users')

user_route.get('/',userController.loadHome)

user_route.get('/login',auth.isLogin,userController.loadLogin)
user_route.post('/login',userController.UserLogin)

user_route.get('/logout',userController.logout)

user_route.get('/otp',userController.loadOtp)
user_route.post('/otp',userController.verifyOtp)

user_route.get('/signup',auth.isLogin,userController.loadSignup)
user_route.post('/signup',userController.insertUser)

user_route.get('/shop',productController.loadShop)

user_route.get('/productView',productController.productView)

user_route.get('/about',userController.loadAbout)

user_route.get('/forgotPassword',userController.loadForgetPassword)

user_route.get('/blog',userController.loadBlog)

module.exports = user_route;

