const Category = require('../model/categoryModal')
const Product = require('../model/productsModal')
const Cart = require('../model/cartModal')
const Sharp = require('sharp')

const loadProduct = async (req, res) => {
  try {
    let page = 1;
    if (req.query.id) {
      page = req.query.id
    }
    let limit = 6;
    let Next = page + 1;
    let previous = page > 1 ? page - 1 : 1

    let count = await Product.find({}).count()

    let totalPages = Math.ceil(count / limit)
    if (Next > totalPages) {
      Next = totalPages
    }
    const products = await Product.find().populate("category")
      .limit(limit)
      .skip((page - 1) * limit)
      .exec()



    res.render('adminProduct',
      {
        products: products,
        next: Next,
        previous: previous,
        totalPages: totalPages
      })

  } catch (error) {
    console.log(error.message);
  }
}

const loadaddProduct = async (req, res) => {
  try {
    const categories = await Category.find({})
    res.render('addProduct', { categories })
  } catch (error) {
    console.log(error.message);
  }
}

const addProduct = async (req, res) => {
  try {
    const details = req.body;
    const files = req.files
    let arrimages = []
    if (Array.isArray(req.files)) {
      for (let i = 0; i < req.files.length; i++) {
        arrimages[i] = req.files[i].filename;
      }
    }
    for (i = 0; i < arrimages.length; i++) {
      await Sharp('public/assets/images/product/productimages/' + req.files[i].filename)
        .resize(500, 500)
        .toFile('public/assets/images/product/sharpedproduct/' + req.files[i].filename)
    }

    if (details.quantity > 0 && details.price > 0) {
      const product = new Product({
        name: details.name,
        previous_price: details.previous_price,
        price: details.price,
        category: details.category,
        description: details.description,
        stock: details.quantity,
        images: arrimages
      })
      await product.save()
    }
    res.redirect('/admin/addProduct')
  } catch (error) {
    console.log(error);
  }
}


const listUnlist = async (req, res) => {
  try {
    const userid = req.body.userid;
    const product = await Product.findOne({ _id: userid })
    if (product.is_Listed) {
      await Product.findByIdAndUpdate({
        _id: userid
      },
        {
          $set: {
            is_Listed: false
          }
        }
      )
    }
    else {
      await Product.findByIdAndUpdate({
        _id: userid
      },
        {
          $set: {
            is_Listed: true
          }
        }
      )
    }
    res.json({ list: true })
  } catch (error) {
    console.log(error.message);
  }
}

const editProductLoad = async (req, res) => {
  try {
    const id = req.query.id
    const product = await Product.findOne({ _id: id })
    const categories = await Category.find({})
    res.render('editProduct', { product, categories })
  } catch (error) {
    console.log(error.message);
  }
}


const editProduct = async (req, res) => {
  try {
    const id = req.query.id
    const newname = req.body.name
    const newprevious_price = req.body.previous_price
    const newprice = req.body.price
    const newquantity = req.body.quantity
    const newcategory = req.body.category
    const newdescription = req.body.description
    const existingData = await Product.find({ _id: id })
    await Product.updateMany({
      _id: id
    },
      {
        $set: {
          name: newname,
          previous_price: newprevious_price,
          price: newprice,
          stock: newquantity,
          category: newcategory,
          description: newdescription,
        }
      })
    const arrimages = [];
    for (let i = 0; i < req.files.length; i++) {
      arrimages.push(req.files[i].filename);
    }
    for (i = 0; i < arrimages.length; i++) {
      await Sharp('public/assets/images/product/productimages/' + req.files[i].filename)
        .resize(500, 500)
        .toFile('public/assets/images/product/sharpedproduct/' + req.files[i].filename)
    }
    if (arrimages) {
      const image1 = arrimages[0] || existingData[0].images[0]
      const image2 = arrimages[1] || existingData[0].images[1]
      const image3 = arrimages[2] || existingData[0].images[2]
      const image4 = arrimages[3] || existingData[0].images[3]
      await Product.updateOne({
        _id: id
      },
        {
          $set: {
            "images.0": image1,
            "images.1": image2,
            "images.2": image3,
            "images.3": image4,
          }
        })


    } else {

    }

    res.redirect('/admin/products')
  } catch (error) {
    console.log(error);
  }
}




//delete product 
const deleteProduct = async (req, res) => {
  try {

    const id = req.body.productid
    await Product.deleteOne({ _id: id })
    res.json({ success: true })

  } catch (error) {
    console.log(error);
  }
}

const loadShop = async (req, res) => {
  let products;
  let category = await Category.find({ isListed: false })
  try {
    let id = req.query.id
    if (req.query.id) {
      products = await Product.find({ category: id, is_Listed: false }).populate("category")
    } else {
      products = await Product.find({ is_Listed: false }).populate("category")
    }
    res.render('shop', { products, category })
  } catch (error) {
    console.log(error.message);
  }
}

//product  view
const productView = async (req, res) => {
  try {
    const productId = req.query.id;
    const userid = req.session.user;
    const product = await Product.findById(productId).populate('category');
    const viewProduct = await Product.findById({ _id: productId });
    const relatedProduct = await Product.find({
      category: viewProduct.category,
      _id: {
        $ne: viewProduct._id
      }
    });

    if (userid) {
      const existscart = await Cart.findOne({ userId: userid });

      if (existscart) {
        const existsProduct = existscart.products.find((pro) => pro.productId.toString() === productId);

        if (existsProduct) {
          return res.render('productDetails', { product, relatedProduct, inCart: true });
        }
      }
    }


    res.render('productDetails', { product, relatedProduct, inCart: false });

  } catch (error) {
    console.log(error.message);
    res.render('errorPage', { errorMessage: 'An error occurred while loading the product details.' });
  }
}

module.exports = {
  loadaddProduct,
  loadProduct,
  addProduct,
  listUnlist,
  editProductLoad,
  editProduct,
  deleteProduct,
  loadShop,
  productView
}