const Category = require('../model/categoryModal');
const Product = require('../model/productsModal');


const loadCategory = async (req, res) => {
  try {
    let page =1;
    if(req.query.id){
      page = req.query.id
    }

    const limit = 6;
    let next = page + 1
    const previous = page > 1? page - 1 :1

    const count = await Category.find().count()

    const totalPages = Math.ceil(count/limit)

    if(next > totalPages){
      next = totalPages
    }

    const category = await Category.find()
    .limit(limit)
    .skip((page - 1) * limit)
    .exec()

    res.render('category', { category ,next,previous,totalPages})
  } catch (error) {
    console.log(error.message);
  }
}

const loadaddCategory = async (req, res) => {
  try {
    res.render('addCategory')
  } catch (error) {
    console.log(error.message);
  }
}

const insertCategory = async (req, res) => {

  try {
    let { name, description } = req.body
    const already = name.toLowerCase()
    const existCategory = await Category.findOne({ name: name })
    if (existCategory) {
      req.flash('error', 'already exists a category with this name')
      res.redirect('/admin/addCategory')
    } else {
      if(already){
        req.flash('error', 'already exists a category with this name')
        res.redirect('/admin/addCategory') 
      }else{
        const category = new Category({
        name: req.body.name,
        description: req.body.description,
        isListed: false
      })
      await category.save()
      res.redirect('/admin/categories')
      }
    }
  } catch (error) {
    console.log(error.messsage);
  }
}



const loadeditCategory = async (req, res) => {
  try {
    const id = req.query.id
    const categoryedit = await Category.findOne({ _id: id })
    res.render('editCategory', { categoryedit })
  } catch (error) {
    console.log(error.message);
  }
}

const editCategory = async (req, res) => {
  try {
    const { id, name, description } = req.body
    const newname = req.body.editname;
    const alread = newname.toLowerCase()
    const newdescription = req.body.editdisc
    const already = await Category.findOne({ _id: { $ne: id }, name: newname })
    if (already) {
      req.flash('error', 'this name is already exist ')
      res.redirect('/admin/categories')
    } else {
      if(alread){
        req.flash('error', 'this name is already exist ')
      res.redirect('/admin/categories')
      }else{
         await Category.findByIdAndUpdate({ _id: id }, { $set: { name: newname, description: newdescription } })
      res.redirect('/admin/categories')
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}



// category lidting and unlisting
const listUnlistCategory = async (req, res) => {
  try {

    const categoryid = req.body.id
    const CategoryData = await Category.findOne({ _id: categoryid })
    if (CategoryData.isListed === true) {

      await Category.findByIdAndUpdate({ _id: categoryid }, { $set: { isListed: false } })
    } else {

      await Category.findByIdAndUpdate({ _id: categoryid }, { $set: { isListed: true } })
    }
    res.json({ list: true })
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  loadaddCategory,
  loadCategory,
  loadeditCategory,
  editCategory,
  listUnlistCategory,
  insertCategory
}