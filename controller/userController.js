const User = require('../model/userModel')
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const userOtpVerification = require('../model/userOTPverification')
const product = require('../model/productsModal')

// loading Home
const loadHome = async (req, res) => {
  try {
    const id =req.session.user
    const user = await User.findOne({_id:id})
    const productDetails = await product.find({})
    res.render('home',{products:productDetails,user:user})
  } catch (error) {
    console.log(error.message);
  }
}



// loading login
const loadLogin = async (req, res) => {
  try {
    res.render('login')
  } catch (error) {
    console.log(error.message);
  }
}


const logout = async(req,res)=>{
  try {
    req.session.user = null
    res.redirect('/')
  } catch (error) {
    console.log(error.message);
  }
}


// password securing
const securePassword = async (password) => {
  try {
    const securePass = await bcrypt.hash(password, 10)
    return securePass;
  }
  catch (error) {
    console.log(error.message);
  }
}



// signup loading 
const loadSignup = (req, res) => {
  try {
    res.render('signup')
  } catch (error) {
    console.log(error.message);
  }
}



// inserting User
const insertUser = async (req, res) => {
  try {
    const email = req.body.email
    const namee = req.body.name
    const findUser = await User.findOne({ email: email })
    const findUserByName = await User.findOne({ name: namee })
    if (findUser) {
      req.flash('exist', 'User already exists with this email')
      res.redirect('/signup')
    }
    else if (findUserByName) {
      req.flash('usernameexist', "Sorry this username is already taken")
      res.redirect('/signup')
    }
    else {
      const securePass = await securePassword(req.body.password)
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: securePass,
        is_admin: 0,
        verified: 0,
        Blocked: false
      })
      sendOtpVerificationMail(user, res)
      await user.save()
    }
  } catch (error) {
    console.log(error.message);
  }
}


// send Otp to verification
const sendOtpVerificationMail = async ({ email }, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'peeru548@gmail.com',
        pass: 'mxdh kfpy qfjy simq'
      }
    })

    // creating otp
    const otp = `${Math.floor(1000 + Math.random() * 9000
    )}`;

    const emailOptions = {
      from: 'peeru548@gmail.com',
      to: email,
      subject: 'verify your email',
      html: `your otp is ${otp}`
    }

    const hashedOtp = await bcrypt.hash(otp, 10)

    const newOtpVerification = await new userOtpVerification({ email: email, otp: hashedOtp })
    await newOtpVerification.save()
    res.redirect(`/otp?email=${email}`);
    await transporter.sendMail(emailOptions)

  } catch (error) {
    console.log(error.message);
  }
}


// otp Loading
const loadOtp = async (req, res) => {
  try {
    const email = req.query.email
    res.render('otp', { email: email })
  } catch (error) {
    console.log(error.message);
  }
}



// Otp verification
const verifyOtp = async (req, res) => {
  try {
    const email = req.body.email
    const otp = req.body.digit1 + req.body.digit2 + req.body.digit3 + req.body.digit4;

    const userVerification = await userOtpVerification.findOne({ email: email })

    if (!userVerification) {
      req.flash('message', 'otp expired')
      res.redirect('/signup')

      return;
    }
    const { otp: hashedOtp } = userVerification;
    const validOtp = await bcrypt.compare(otp, hashedOtp)
    if (validOtp) {
      const userData = await User.findOne({ email: email });
      if (userData) {
        await User.findByIdAndUpdate({
          _id: userData._id
        }, {
          $set: {
            verified: true
          }
        })
      }
    }
    const user = await User.findOne({ email: email })
    await userOtpVerification.deleteOne({ email: email })
    if (user.verified) {
      if (!user.Blocked) {
        req.session.user = {
          _id: user._id,
          name: user.name,
          email: user.email
        }
        res.redirect('/')
      } else {
        console.log("user blocked from this site");


        req.flash('blocked', 'you are blocked from this contact with admin');
        res.redirect(`/otp?email=${email}`)

      }
    } else {
      console.log("otp incorrect else worked")

      req.flash('incorrect', 'otp is incorrect');
      res.redirect(`/otp?email=${email}`)

    }
  }
  catch (error) {
    console.log(error);
  }
}



// UserLogin
const UserLogin = async (req, res) => {
  try {
    const email = req.body.email
    const user = await User.findOne({ email: email })
    if (user) {

      if (user.verified) {

        if (user.Blocked) {
          req.flash('error', 'User is blocked by the admin')
          res.redirect('/login')
        } else {
          const password = req.body.password;
          const dbpass = user.password
          const pass = await bcrypt.compare(password, dbpass)
          if (pass) {
            req.session.user = {
              email: user.email,
              _id: user._id,
              name: user.name
            }
            res.redirect('/')
          } else {
            req.flash('error', 'Incorrect Password')
            res.redirect('/login')
            console.log("incorrect password");
          }
        }
      } else {
        console.log("user is not verified");
        req.flash('error', 'user is not found')
      res.redirect('/login')
      }

    } else {
      req.flash('error', 'user is not found')
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error.message);
  }
}

const loadAbout = async(req,res)=>{
  try {
    res.render('about')
  } catch (error) {
    console.log(error.message);
  }
}

const loadBlog = async(req,res)=>{
  try {
    res.render('blog')
  } catch (error) {
    console.log(error.message);
  }
}


const loadForgetPassword = async(req,res)=>{
  try {
    res.render('forgetPassword')
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  insertUser,
  loadSignup,
  loadOtp,
  verifyOtp,
  loadLogin,
  loadHome,
  UserLogin,
  logout,
  loadAbout,
  loadForgetPassword,
  loadBlog

}