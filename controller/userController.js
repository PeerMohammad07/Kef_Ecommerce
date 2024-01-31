const User = require('../model/userModel')
const Cart = require('../model/cartModal')
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const userOtpVerification = require('../model/userOTPverification')
const product = require('../model/productsModal')
const Token = require('../model/tokenModal')
const crypto = require('crypto')
// loading Home
const loadHome = async (req, res) => {
  try {
    const id = req.session.user
    const user = await User.findOne({ _id: id })
    const productDetails = await product.find({})
    res.render('home', { products: productDetails, user: user })
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


const logout = async (req, res) => {
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
      req.flash('message', 'User verification data not found');
      res.redirect(`/otp?email=${email}`);
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
    else {
      req.flash('expire', 'Incorrect otp')
      res.redirect(`/otp?email=${email}`)
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
        res.redirect('/login')
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

const loadAbout = async (req, res) => {
  try {
    res.render('about')
  } catch (error) {
    console.log(error.message);
  }
}

const loadBlog = async (req, res) => {
  try {
    res.render('blog')
  } catch (error) {
    console.log(error.message);
  }
}


const loadForgetPassword = async (req, res) => {
  try {
    res.render('forgetPassword')
  } catch (error) {
    console.log(error.message);
  }
}

const resetPass = async (email, res) => {
  try {
    email = email;

    const user = await User.findOne({ email: email })
    if (!user) {
      return res.status(400).send('user with this email is not existing')
    }
    let token = await Token.findOne({ userId: user._id })
    if (!token) {
      token = await new Token({ userId: user._id, Token: crypto.randomBytes(32).toString("hex") })
      token.save()
    }
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

    const resetPage = `http://localhost:3000/resetPassword/${user._id}/${token.Token}`

    const mailOptions = {
      from: 'peeru548@gmail.com',
      to: email,
      subject: 'verify your email',
      html: `your reset password link is ${resetPage}`
    }

    await transporter.sendMail(mailOptions)

  } catch (error) {
    console.log(error.message);
  }
}

const forgetPassword = async (req, res) => {
  try {
    const email = req.body.mail;
    await resetPass(email, res)
    req.flash('success', 'Sent a reset password link to your email')
    res.redirect('/login')
  } catch (error) {
    console.log(error.message);
  }
}

const loadResetPass = async (req, res) => {
  try {
    const userid = req.params.id;
    const token = req.params.token;
    res.render('resetPassword', { userId: userid, token: token })
  } catch (error) {
    console.log(error.message);
  }
}


const resetPassword = async (req, res) => {
  try {
    const userid = req.body.userId;
    const token = req.body.token;
    confirmPassword = req.body.confirmpassword
    console.log(userid);
    const user = await User.findOne({ _id: userid })
    console.log(user);
    if (!user) {
      return res.status(400).send('Invalid Link or expired')
    }
    const { email } = user;

    const tok = await Token.findOne({ Token: token, userId: userid })

    if (!tok) {
      return res.status(400).send('Invalid Link or expired')
    }

    const securePass = await securePassword(confirmPassword)

    await User.updateOne({
      email: email
    },
      {
        $set: {
          password: securePass
        }
      })

    req.flash('newsuccess', 'New Password added')
    res.redirect('/login')

  } catch (error) {
    console.log(error.message);
  }
}

const loadProfile = async (req, res) => {
  try {
    id = req.session.user._id;
    const userData = await User.findOne({ _id: id })
    res.render('profile', { user: userData })
  } catch (error) {
    console.log(error);
  }
}

const addAddress = async (req, res) => {
  try {
    const {
      name,
      state,
      city,
      pin,
      phone,
      email
    } = req.body;
    console.log(email);
    await User.findOneAndUpdate({ email: email },
      {
        $push: {
          addresses: {
            name: name,
            state: state,
            city: city,
            pinNo: pin,
            phNo: phone,
          }
        }
      })
    res.json({ added: true })
  } catch (error) {
    console.log(error);
  }
}


//editAddress
// const editAddress = async (req, res) => {
//   try {
//     const { editname,
//       editstate,
//       editcity,
//       editpin,
//       editphone,
//       email } = req.body;
//       await User.findOneAndUpdate({
//         email:email
//       },{

//       })
//   } catch (error) {
//     console.log(error.message);
//   }
// }








const loadeditProfile = async (req, res) => {
  try {
    const id = req.query.id
    const user = await User.findOne({ _id: id })
    res.render('editProfile', { user: user })
  } catch (error) {
    console.log(error.message);
  }
}

const editProfile = async (req, res) => {
  try {
    const { id, editname, editphone } = req.body;
    await User.findByIdAndUpdate({ _id: id }, { name: editname, mobile: editphone })
    res.redirect('/profile')
  } catch (error) {
    console.log(error.message);
  }
}

const changePassword = async (req, res) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;
  const userId = req.session.user._id;
  try {
    console.log("worked");
    //find by user id
    const user = await User.findById(userId)

    //no user
    if (!user) {
      console.log("no user");
      return res.status(404).json({ 'error': 'User not found' })
    }

    if (currentPassword == confirmPassword) {
      return res.json({ message: 'current password and new password are same ' })
    }

    //pass and confpass not eq
    if (newPassword != confirmPassword) {
      console.log("pass not match");
      return res.json({ message: 'New password and confirm password do not match' })
    }

    //passmatch
    const matchPassword = await bcrypt.compare(currentPassword, user.password)

    //hash pass
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(confirmPassword, saltRounds)

    //save pass
    if (matchPassword) {
      console.log("updated");
      await User.findOneAndUpdate({ email: user.email },
        {
          $set:
            { password: hashedPassword }
        },
        { new: true }
      )
      return res.status(200).json({ success: true, message: 'Password updated successfully.' });
    }
    //curent pass is wrong
    else {
      return res.json({ message: 'Current password is wrong' })
    }
  }
  catch (error) {
    console.log(error.message)
  }
}


const removeAddress = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addressId = req.body.id
    console.log("helo");
    await User.findByIdAndUpdate({ _id: userId },
      {
        $pull: {
          addresses: {
            _id: addressId
          }
        }
      })
    res.redirect('/profile')
  } catch (error) {
    console.log(error.message);
  }
}



const loadCheckout = async (req, res) => {
  try {
    const userid = req.session.user._id
    const user = await User.findOne({_id:userid})
    const cart = await Cart.findOne({userId:userid}).populate('products.productId')
    res.render('checkout',{user:user,cart:cart.products})
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
  loadBlog,
  forgetPassword,
  loadResetPass,
  resetPassword,
  loadProfile,
  addAddress,
  loadeditProfile,
  editProfile,
  changePassword,
  removeAddress,
  loadCheckout,
}