const User = require("../../models/userSchema");
const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema")
const dotenv = require("dotenv")
dotenv.config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt")

const pageNotFound = async (req, res) => {
    try {
        res.render("page-404");
    } catch (error) {
        res.redirect("/pageNotFound", error);
    }
}

const loadHomepage = async (req, res) => {
  try {
    const user = req.session.user; 
    const categories = await Category.find({ isListed: true });

    let productData = await Product.find({
      isBlocked: false,
      category: { $in: categories.map(category => category._id) },
      quantity: { $gt: 0 },
    });

    // Sort products by latest uploads
    productData.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));

    res.render("home", { user, products: productData });
  } catch (error) {
    console.error("Home page not found", error.message);
    res.status(500).send("Server error");
  }
};


const loadSignup = async (req, res) => {
    try {
        return res.render("signup")
    } catch (error) {
        console.log("Home page not found", error);
        res.status(500).send("Server Error.");
    }
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD
            }
        })

        const info = await transporter.sendMail({
            from: process.env.ODEMAILER_EMAIL,
            to: email,
            subject: "verify your account",
            text: `Your OTP is : ${otp}`,
            html: `<b> Your OTP : ${otp} </b>`
        })
        return info.accepted.length > 0
    } catch (error) {
        console.error("Error Sending Email");
        return false
    }
}

const signup = async (req, res) => {
    try {
        const { name, phone, email, password, cPassword } = req.body;

        if (password !== cPassword) {
            return res.render("signup", { message: "Password do not match" })
        }

        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.render("signup", { message: "User with this email is already exist" })
        }

        const otp = generateOtp();

        const emailSend = await sendVerificationEmail(email, otp);
        if (!emailSend) {
            return res.json("email error")
        }

        req.session.userOtp = otp;
        req.session.userData = { name, phone, email, password };

        res.render("verify-otp");
        console.log("OTP send : ", otp);

    } catch (error) {
        console.error("Signup error", error);
        res.redirect("/pageNotFound")
    }
}

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)

        return passwordHash
    } catch (error) {

    }
}

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        console.log("otp :", otp, req.session.userOtp);

        if (otp === req.session.userOtp) {
            const user = req.session.userData

            const passwordHash = await securePassword(user.password);

            const saveUserData = new User({
                name: user.name,
                email: user.email,
                phone: user.phone,
                password: passwordHash
            })

            await saveUserData.save();
            res.json({ success: true, redirectUrl: "/login" })
        }
        else {
            res.status(400).json({ success: false, message:"Invalid OTP, Please try again." })
        }

    } catch (error) {

        console.error("Error Verifying Otp", error);
        res.status(500).json({ success: false, message: "An error occured..!" })

    }
}

const resendOtp = async (req, res) => {
    try {
        const { email } = req.session.userData;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email not found in session" })
        }
        const otp = generateOtp();
        req.session.userOtp = otp;

        const emailSend = await sendVerificationEmail(email, otp)
        if (emailSend) {
            console.log("Resend OTP : ", otp);
            res.status(200).json({ success: true, message: "OTP resend succesfully" })
        } else {
            res.status(500).json({ success: false, message: "Faied to Resend OTP, please try again" })
        }
    } catch (error) {
        console.error("Error resending OTP", error);
        res.status(500).send({ success: false, message: "Internal server error, please try again." })
    }
}

const loadLogin = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.render("login")
        } else {
            res.redirect("/")
        }
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const findUser = await User.findOne({ isAdmin: 0, email });
        if (!findUser) {
            return res.render("login", { message: "User not found" })
        }
        if (findUser.isBlocked) {
            return res.render("login", { message: "User is blocked by admin" })
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password);
        if (!passwordMatch) {
            return res.render("login", { message: "Incorrect password" });
        }

        req.session.user = { _id: findUser._id, name: findUser.name }
        res.redirect("/")
    } catch (error) {
        console.error("Login error", error);
        res.render("login", { message: "Login failed, please try again later" })
    }
}


const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Session destuction error", err.message);
                return res.redirect("/pageNotFound");
            }
            return res.redirect("/login")
        })
    } catch (error) {
        console.log("Logout Error");
        res.redirect("/pageNotFound")
    }
}


module.exports = {
    loadHomepage,
    pageNotFound,
    loadSignup,
    signup,
    verifyOtp,
    resendOtp,
    loadLogin,
    login,
    logout
}