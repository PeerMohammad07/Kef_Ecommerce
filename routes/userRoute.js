const express = require("express")
const user_route = express()
const config = require('../configuration/config')
const User = require("../model/userModel")
const userController = require("../controller/userController")
const auth = require('../middlewares/userAuth')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
const couponController = require('../controller/couponController')
//session
const session = require("express-session")
user_route.use(session({ secret: config.sessionsecret, resave: false, saveUninitialized: false }))

user_route.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.LoggedIn = req.session.user ? true : false;
  next()
})

user_route.use(express.json())
user_route.use(express.urlencoded({ extended: true }))

//view engine
user_route.set('view engine', 'ejs')
user_route.set('views', './view/users')

user_route.get('/', userController.loadHome)

user_route.get('/login', userController.loadLogin)
user_route.post('/login', userController.UserLogin)

user_route.get('/logout', userController.logout)

user_route.get('/otp', userController.loadOtp)
user_route.post('/otp', userController.verifyOtp)

user_route.get('/signup', userController.loadSignup)
user_route.post('/signup', userController.insertUser)

user_route.get('/shop', productController.loadShop)

user_route.get('/productView', productController.productView)

user_route.get('/about', userController.loadAbout)

user_route.get('/forgotPassword', userController.loadForgetPassword)
user_route.post('/forgotPassword', userController.forgetPassword)

user_route.get('/resetPassword/:id/:token', userController.loadResetPass)
user_route.post('/resetPassword', userController.resetPassword)

user_route.get('/blog', userController.loadBlog)

user_route.post('/addToCart', cartController.addToCart)
user_route.get('/cart', auth.isLogout, cartController.loadCart)
user_route.post('/removeCart', auth.isLogout, cartController.removeCart)
user_route.get('/checkout', auth.isLogout, userController.loadCheckout)
user_route.post('/updateQuantity', auth.isLogout, cartController.updateQuantity)
user_route.post('/placeOrder', auth.isLogout, orderController.placeOrder)
user_route.post('/verifyPayment', auth.isLogout, orderController.verifyPayment)

//Profile Section
user_route.get('/profile', auth.isLogout, userController.loadProfile)
user_route.post('/addAddress', auth.isLogout, userController.addAddress)
user_route.get('/editAddress', auth.isLogout, userController.loadeditAddress)
user_route.post('/editAddress', userController.editAddress)
user_route.get('/editProfile', auth.isLogout, userController.loadeditProfile)
user_route.post('/editProfile', auth.isLogout, userController.editProfile)
user_route.post('/changePassword', auth.isLogout, userController.changePassword)
user_route.post('/removeAddress', auth.isLogout, userController.removeAddress)


user_route.get('/whishList', auth.isLogout, cartController.loadWishList)
user_route.post('/addToWishlist', auth.isLogout, cartController.addToWishlist)
user_route.post('/removeWishlist', auth.isLogout, cartController.removeWishlist)

user_route.get('/orderSuccess/:id', auth.isLogout, orderController.loadOrderSuccess)
user_route.get('/orderDetails', auth.isLogout, orderController.orderDetails)
user_route.get('/myOrders', auth.isLogout, orderController.loadMyOrder)
user_route.post('/cancelOrder', auth.isLogout, orderController.cancelOrder)

user_route.get('/myCoupons',couponController.loadMyCoupon)
user_route.post('/checkCoupon',couponController.checkCoupon)

user_route.post('/returnRequest',orderController.returnRequest)

module.exports = user_route;




