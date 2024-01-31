const express = require("express")
const user_route = express()
const config = require('../configuration/config')
const User = require("../model/userModel")
const userController = require("../controller/userController")
const auth = require('../middlewares/userAuth')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
//session
const session = require("express-session")
const { userManagementsystem } = require("../controller/adminController")
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

user_route.get('/login',userController.loadLogin)
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
user_route.post('/forgotPassword',userController.forgetPassword)

user_route.get('/resetPassword/:id/:token',userController.loadResetPass)
user_route.post('/resetPassword',userController.resetPassword)

user_route.get('/blog',userController.loadBlog)

user_route.post('/addToCart',cartController.addToCart)

user_route.get('/cart',cartController.loadCart)

user_route.post('/removeCart',cartController.removeCart)

user_route.get('/checkout',userController.loadCheckout)

user_route.post('/placeOrder',orderController.placeOrder)

//Profile Section
user_route.get('/profile',userController.loadProfile)
user_route.post('/addAddress',userController.addAddress)
// user_route.post('/editAddress',userController.editAddress)
user_route.get('/editProfile',userController.loadeditProfile)
user_route.post('/editProfile',userController.editProfile)
user_route.post('/changePassword',userController.changePassword)
user_route.post('/removeAddress',userController.removeAddress)


user_route.get('/orderSuccess/:id',orderController.loadOrderSuccess)

user_route.get('/orderDetails',orderController.orderDetails)

user_route.get('/myOrders',orderController.loadMyOrder)

user_route.post('/updateQuantity',cartController.updateQuantity)

user_route.post('/cancelOrder',orderController.cancelOrder)

user_route.post('/verifyPayment',orderController.verifyPayment)

module.exports = user_route;




