
const mongoose = require("mongoose")

const {Schema} = mongoose

const productSchema = new Schema({
    productName:{
        type : String,
        required:true
    },
    description:{
        type : String,
        required : String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: "Category",                     
        required: true,
    },
    regularPrice:{
        type :Number,
        required : true
    },
    salePrice:{
        type :Number,
        required : true
    },
    productOffer:{
        type : Number,
        default : 0
    },
    quantity:{
        type : Number,
        default : true
    },
    // meterial:{
    //     type : [String],
    //     required : false
    // },
    productImage:{
        type :[String],
        required : true
    },
    isBlocked :{
        type : Boolean,
        default : false
    },
    status :{
        type : String,
        enum : ["Available", "Out of Stock", "Discountinued"],
        required : true,
        default : "Available"
    },
    createdOn:{
        type:Date,
        default:Date.now
    }
},{Timestamp:true})


const Product = mongoose.model("Product", productSchema)

module.exports = Product