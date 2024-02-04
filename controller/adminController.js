const User = require("../model/userModel")
const bcrypt = require("bcrypt")
const Order = require('../model/orderModal')
const Product = require("../model/productsModal")
const Category = require('../model/categoryModal')

// loading admin LOgin 
const AdminLogin = async (req, res) => {
  try {
    res.render('adminLogin')
  } catch (error) {
    console.log(error.message);
  }
}


// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Inserting admin>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const insertAdmin = async (req, res) => {
  try {
    const email = req.body.email
    const pas = req.body.password
    const admin = await User.findOne({ email: email })
    if (admin) {
      if (admin.is_admin) {
        const pass = await bcrypt.compare(pas, admin.password)
        if (pass) {
          req.session.admin = {
            _id: admin._id,
            email: admin.email,
            name: admin.name
          }
          res.redirect("/admin/dashboard")
        } else {
          req.flash('error', 'incorrect password')
          res.redirect('/admin/')
        }
      } else {
        req.flash('error', 'you are not admin')
        res.redirect('/admin/')
      }
    } else {
      req.flash('error', "you are not registered")
      res.redirect('/admin/')
    }
  } catch (error) {
    console.log(error.message);
  }
}




// admin Logout
const Adminlogout = async (req, res) => {
  try {
    console.log(req.session.admin, "hlo");
    req.session.admin = false
    res.redirect('/admin')
  } catch (error) {
    console.log(error.message);
  }
}


const userManagementsystem = async (req, res) => {
  try {
    let page = 1;
    if (req.query.id) {
      page = req.query.id
    }
    let limit = 6;
    let next = page + 1;
    let previous = page > 1 ? page - 1 : 1

    const count = await User.find({
      is_admin: 0
    }).count()

    let totalPages = Math.ceil(count / limit)
    if (next > totalPages) {
      next = totalPages
    }

    const user = await User.find({
      is_admin: 0,

    }).limit(limit)
      .skip((page - 1) * limit)
      .exec()

    res.render('userms', {
      users: user,
      page: page,
      previous: previous,
      next: next,
      totalPages: totalPages
    })
  } catch (error) {
    console.log(error.message);
  }
}


const loadDashboard = async (req, res) => {
  try {

    let page = 1;
    if (req.query.id) {
      page = req.query.id
    }
    const limit = 6;
    const previous = page > 1 ? page - 1 : 1;
    let next = page + 1

    const count = await Order.find({}).count()

    const totalPages = Math.ceil(count / limit)
    if (next > totalPages) {
      next = totalPages
    }

    const orders = await Order.find({})
    let delivered = 0;
    let cancelled = 0;
    let placed = 0;
    let returns = 0;
    orders.map((order) => {
      order.products.map((product) => {
        if (product.status == 'delivered') {
          delivered++
        } else if (product.status == 'placed') {
          placed++
        } else if (product.status == 'cancelled') {
          cancelled++
        } else if (product.status == 'returns') {
          returns++
        }
      })
    })

    const latestOrders = await Order.find({}).sort({ date: -1 }).populate('userId').limit(limit).skip((page - 1) * limit).exec()
    const total = await Order.aggregate([{ $match: { 'products.status': 'delivered' } }, { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }])
    const totalRevenue = total.map((value) => value.totalRevenue)[0] || 0
    const orderCount = await Order.find({}).count()
    const productCount = await Product.find({}).count()
    const categoryCount = await Category.find({}).count()
    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const monthly = await Order.aggregate([{ $match: { 'products.status': 'delivered', date: { $gt: startOfMonth, $lt: endOfMonth } } }, { $group: { _id: null, monthlyRevenue: { $sum: '$totalAmount' } } }])
    const monthlyRevenue = monthly.map((value) => value.monthlyRevenue)[0] || 0;
    const users = await User.find({ verified: true }).count()


    const currentMonthh = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const defaultMonthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0,
      count: 0
    }))

    monthlySalesData = await Order.aggregate([
      {$unwind:'$products'},

      {$match:{
       "products.status" :"delivered",
       status:{$ne:'cancelled'},
       date:{$gte:new Date(currentYear, 0, 1)}
      }},

      {
        $group:{
          _id:{$month:'$date'},
          total:{$sum:"$totalAmount"},
          countt:{$sum:1}
        }
      },
     {
      $project:{
        _id:0,
        month:'$_id',
        total:'$total',
        count:'$countt'
      }
     }
    ])
    
    const updatedMonthlyValue = defaultMonthly.map((defaultMonth)=>{
      const foundMonth = monthlySalesData.find((monthdata)=>{
       return monthdata.month == defaultMonth.month
      })
      return foundMonth || defaultMonth
    })


    const currentDate = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(currentDate.getDate() - 15);
    
    // Generate an array with all days in the last 15 days
    const allDays = Array.from({ length: 15 }, (_, index) => {
      const day = new Date();
      day.setDate(fifteenDaysAgo.getDate() + index);
      return { day: day.getDate(), total: 0, count: 0 };
    });
    
    fiftyDaysSales = await Order.aggregate([
      { $unwind: '$products' },
      {
        $match: {
          'products.status': 'delivered',
          status: { $ne: 'cancelled' },
          date: { $gte: fifteenDaysAgo, $lte: currentDate },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          total: { $sum: '$totalAmount' },
          countt: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          day: '$_id',
          total: '$total',
          count: '$countt',
        },
      },
    ]);
    
    const mergedData = allDays.map((dayData) => {
      const foundData = fiftyDaysSales.find((data) => data.day === dayData.day);
      return foundData || dayData;
    });
    


const codCount = await Order.aggregate([
  {
    $match: {
      paymentMethod: 'COD',
      status: { $ne: 'cancelled' }
    }
  },{
    $group:{
      _id:null,
      count:{$sum:1}
    }
  }
]);
 
const COD = codCount[0].count || 0

const Razorpay = await Order.aggregate([
  {
    $match: {
      paymentMethod: 'razorpay',
      status: { $ne: 'cancelled' }
    }
  },{
    $group:{
      _id:null,
      count:{$sum:1}
    }
  }
]);

const razorpay = Razorpay[0].count || 0


    res.render('adminDashboard',
      {
        latestOrders,
        orderCount,
        productCount,
        categoryCount,
        totalRevenue,
        monthlyRevenue,
        totalPages,
        next,
        previous,
        delivered,
        cancelled,
        placed,
        returns,
        users,
        updatedMonthlyValue,
        COD,
        razorpay,
        mergedData
      })
  } catch (error) {
    console.log(error);
  }
}

const blockUser = async (req, res) => {

  try {
    const id = req.body.id;
    let user = await User.findOne({ _id: id })
    if (user.Blocked) {
      await User.updateOne({ _id: id }, { $set: { Blocked: false } })
    } else {
      await User.updateOne({ _id: id }, { $set: { Blocked: true } })
    }
    res.json({ block: true })
  } catch (error) {
    console.log(error.message);
  }
}

const loadOrder = async (req, res) => {
  try {
    const order = await Order.find({})
      .populate('userId')
      .populate('products.productId')
      .sort({ date: -1 })
    res.render('adminOrders', { order: order })
  } catch (error) {
    console.log(error.message);
  }
}

const singleProductView = async (req, res) => {
  try {
    const orderId = req.query.orderId
    const order = await Order.findOne({ _id: orderId }).populate('userId').populate('products.productId')
    res.render('singleOrderDetails', { order: order })
  } catch (error) {
    console.log(error.message);
  }
}

const changeOrderStatus = async (req, res) => {
  try {
    const { orderId, productId, status, userId } = req.body;
    console.log(orderId, productId, status, userId);
    const orderData = await Order.findOneAndUpdate({ _id: orderId, userId: userId, 'products.productId': productId }, { $set: { 'products.$.status': status } })
    console.log(orderData, 'update');
    res.json({ change: true })

  } catch (error) {
    console.log(error.message);
  }
}

const cancelOrder = async (req, res) => {
  try {
    const { orderId, productId } = req.body;

    const orderData = await Order.findOneAndUpdate(
      { _id: orderId, 'products.productId': productId },
      { $set: { 'products.$.status': 'cancelled' } })
    const productDetails = await Order.findOne(
      { _id: orderId, 'products.productId': productId },
      { 'products.$': 1 }
    );

    const productQty = productDetails.products[0].quantity;

    await Product.updateOne({ _id: productId }, { $inc: { stock: productQty } })
    res.json({ cancel: true })
  } catch (error) {
    console.log(error.message);
  }
}

const loadCreateReport = async (req, res) => {
  try {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const orders = await Order.find({date:{$gte:startDate,$lte:endDate}}).populate('userId').populate('products.productId')
    res.render('report',{orders})
  } catch (error) {
    console.log(error.message);
  }
}




module.exports = {
  AdminLogin,
  insertAdmin,
  Adminlogout,
  userManagementsystem,
  loadDashboard,
  blockUser,
  loadOrder,
  singleProductView,
  changeOrderStatus,
  cancelOrder,
  loadCreateReport,
}