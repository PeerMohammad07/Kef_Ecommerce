const express = require("express")
const admin_route = express()
const adminController = require('../controller/adminController')
const productController = require('../controller/productController')
const multer = require('../middlewares/multer')
const categoryController = require('../controller/categoryController')
const adminAuth = require('../middlewares/adminAuth')

admin_route.set('view engine','ejs')
admin_route.set('views','./view/admin')

admin_route.use(express.json())
admin_route.use( express.urlencoded({extended : true}))

admin_route.get('/',adminAuth.isLogin,adminController.AdminLogin)
admin_route.post('/',adminController.insertAdmin)
admin_route.get('/Logout',adminController.Adminlogout)
admin_route.get('/dashboard',adminAuth.isLogout,adminController.loadDashboard)


//user
admin_route.get('/userms',adminAuth.isLogout,adminController.userManagementsystem)
admin_route.post('/listuser',productController.listUnlist)
admin_route.post('/blockUser',adminController.blockUser)



//Products
admin_route.get('/products',adminAuth.isLogout,productController.loadProduct)
admin_route.get('/addProduct',adminAuth.isLogout,productController.loadaddProduct)
admin_route.post('/addProduct',multer.array('images'),productController.addProduct)
admin_route.get('/edit-product',adminAuth.isLogout,productController.editProductLoad)
admin_route.post('/edit-product',multer.array('images'),productController.editProduct)
admin_route.post('/deleteProduct',productController.deleteProduct)


// Category 
admin_route.get('/categories',adminAuth.isLogout,categoryController.loadCategory)
admin_route.post('/categories',categoryController.insertCategory)
admin_route.get('/addCategory',adminAuth.isLogout,categoryController.loadaddCategory)
admin_route.get('/editCategory',adminAuth.isLogout,categoryController.loadeditCategory)
admin_route.post('/editCategory',categoryController.editCategory)
admin_route.post('/list-Unlist',categoryController.listUnlistCategory)



admin_route.get('/orders',adminAuth.isLogout,adminController.loadOrder)
admin_route.get('/singleOrderDetails',adminAuth.isLogout,adminController.singleProductView)
admin_route.post('/changeOrderStatus',adminController.changeOrderStatus)
admin_route.post('/cancelOrder',adminController.cancelOrder)

//dashboard
admin_route.post('/createReport',adminController.loadCreateReport)


module.exports = admin_route;