const express = require("express")
const admin_route = express()
const adminController = require('../controller/adminController')
const productController = require('../controller/productController')
const multer = require('../middlewares/multer')
const categoryController = require('../controller/categoryController')
const adminAuth = require('../middlewares/adminAuth')
const couponController = require('../controller/couponController')
const bannerController = require('../controller/bannerController')
const offerController = require('../controller/offerController')

admin_route.set('view engine', 'ejs')
admin_route.set('views', './view/admin')

admin_route.use(express.json())
admin_route.use(express.urlencoded({ extended: true }))

admin_route.get('/', adminAuth.isLogin, adminController.AdminLogin)
admin_route.post('/', adminController.insertAdmin)
admin_route.get('/Logout', adminController.Adminlogout)
admin_route.get('/dashboard', adminAuth.isLogout, adminController.loadDashboard)


//user
admin_route.get('/userms', adminAuth.isLogout, adminController.userManagementsystem)
admin_route.post('/blockUser', adminController.blockUser)


//Products
admin_route.post('/listuser', productController.listUnlist)
admin_route.get('/products', adminAuth.isLogout, productController.loadProduct)
admin_route.get('/addProduct', adminAuth.isLogout, productController.loadaddProduct)
admin_route.post('/addProduct', multer.upload.array('images'), productController.addProduct)
admin_route.get('/edit-product', adminAuth.isLogout, productController.editProductLoad)
admin_route.post('/edit-product', multer.upload.array('images'), productController.editProduct)
admin_route.post('/deleteProduct', productController.deleteProduct)
admin_route.post('/removeImage',productController.removeImage)

// Category 
admin_route.get('/categories', adminAuth.isLogout, categoryController.loadCategory)
admin_route.post('/categories', categoryController.insertCategory)
admin_route.get('/addCategory', adminAuth.isLogout, categoryController.loadaddCategory)
admin_route.get('/editCategory', adminAuth.isLogout, categoryController.loadeditCategory)
admin_route.post('/editCategory', categoryController.editCategory)
admin_route.post('/list-Unlist', categoryController.listUnlistCategory)



admin_route.get('/orders', adminAuth.isLogout, adminController.loadOrder)
admin_route.get('/singleOrderDetails', adminAuth.isLogout, adminController.singleProductView)
admin_route.post('/changeOrderStatus', adminController.changeOrderStatus)
admin_route.post('/cancelOrder', adminController.cancelOrder)

//dashboard
admin_route.post('/createReport', adminController.loadCreateReport)

admin_route.get('/coupons',adminAuth.isLogout,couponController.loadCoupon)
admin_route.get('/addCoupon',adminAuth.isLogout,couponController.loadaddCoupon)
admin_route.post('/addCoupon',couponController.addCoupon)
admin_route.get('/editCoupon',adminAuth.isLogout,couponController.loadeditCoupon)
admin_route.post('/editCoupon',couponController.editCoupon)
admin_route.post('/listCoupon',couponController.listCoupon)

admin_route.post('/changeReturnStatus',adminController.changeReturnStatus)

admin_route.get('/banners',adminAuth.isLogout,bannerController.loadBanner)
admin_route.get('/addBanner',adminAuth.isLogout,bannerController.loadAddBanner)
admin_route.post('/addBanner',multer.uploadBanner.single('image'),bannerController.addBanner)
admin_route.get('/editBanner',adminAuth.isLogout,bannerController.loadEditBanner)
admin_route.post('/editBanner',multer.uploadBanner.single('image'),bannerController.editBanner)
admin_route.post('/listBanner',adminAuth.isLogout,bannerController.listBanner)

admin_route.get('/offers',adminAuth.isLogout,offerController.loadOffer)
admin_route.get('/addOffer',adminAuth.isLogout,offerController.loadAddOffer)
admin_route.post('/addOffer',adminAuth.isLogout,offerController.addOffer)
admin_route.get('/editOffer',adminAuth.isLogout,offerController.loadEditOffer)
admin_route.post('/editOffer',adminAuth.isLogout,offerController.editOffer)
admin_route.post('/addProductOffer',adminAuth.isLogout,offerController.addProductOffer)
admin_route.get('/applyOffer',adminAuth.isLogout,offerController.loadApplyOffer)
admin_route.post('/removeProductOffer',adminAuth.isLogout,offerController.removeProductOffer)
admin_route.get('/applyCategoryOffer',adminAuth.isLogout,offerController.loadApplyOfferCategory)
admin_route.post('/addCategoryOffer',adminAuth.isLogout,offerController.addCategoryOffer)
admin_route.post('/removeCategoryOffer',adminAuth.isLogout,offerController.removeCategoryOffer)

module.exports = admin_route;