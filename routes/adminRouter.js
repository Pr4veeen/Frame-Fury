const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const categoryController = require("../controllers/admin/categoryController");
const productController = require("../controllers/admin/productController")
const {userAuth, adminAuth} = require("../middlewares/auth")
const multer = require("multer")
const storage = require("../helpers/multer")
const uploads = multer({storage:storage})

router.get("/pageerror", adminController.pageerror)

//login management
router.get("/login", adminController.loadLogin)
router.post("/login", adminController.login)
router.get("/", adminAuth, adminController.loadDashboard)
router.get("/logout", adminController.logout)

//customer management
router.get("/users", adminAuth, customerController.customerInfo)
router.get("/blockCustomer", adminAuth, customerController.customerBlocked)
router.get("/unBlockCustomer", adminAuth, customerController.customerunBlocked)

//category management
router.get("/category", adminAuth, categoryController.categoryInfo)
router.post("/addCategory", adminAuth, categoryController.addCategory)

// listing category
router.get("/listCategory", adminAuth, categoryController.listCategory)
router.get("/unlistCategory", adminAuth, categoryController.unlistCategory)
router.get("/editCategory", adminAuth, categoryController.editCategory)
router.post("/editCategory/:id", adminAuth, categoryController.updateCategory)

//product management
router.get("/addProductS", adminAuth, productController.productAddpage)
router.post("/addProducts", adminAuth, uploads.array("images", 4), productController.addProducts)
router.get("/products",adminAuth,productController.getAllProducts)

//block / unblock product
router.get("/blockProduct",adminAuth,productController.blockProduct)
router.get("/unblockProduct",adminAuth,productController.unblockProduct)

router.get("/editProduct",adminAuth,productController.editProduct)
router.post("/editProduct/:id",adminAuth,uploads.array("images",4),productController.updateProduct)
router.post("/deleteImage",adminAuth,productController.deleteImage)



module.exports = router