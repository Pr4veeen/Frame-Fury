const Order = require("../../models/orderSchema")
const Address = require("../../models/addressSchema");
const Product = require("../../models/productSchema");

const orderDetails = async(req,res)=>{
    try {
        const user =req.session.user
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId)
        .populate("items.productId","productName productImage").exec();


        res.render("order-details",{user,order})
    } catch (error) {
        console.error("Error in showing order details",error);
        res.redirect("/pageNotFound")
    }
}


const orderCancel = async(req,res)=>{
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);
        //console.log("order : ",order);
        

        if(order.orderStatus === "Pending" || order.orderStatus === "Confirmed"){

            const promiseAll =order.items.map(async(item)=>{
                const product =await Product.findById(item.productId);
                if(product){
                    product.quantity += item.quantity
                    await product.save()
                }
            })

            await Promise.all(promiseAll);

            order.orderStatus = "Cancelled"
            await order.save();

            console.log("order cancelled succussfully...");
            
            res.status(200).json({success:true,message:"Order Cancelled successfully"})
        }else if(order.orderStatus === "Shipped"){
            res.status(400).json({success:false,message:"Order Can't Cancel, Shipping started.."})
        }

    } catch (error) {
        console.error("Error in cancelling order",error);
        res.status(500).json({message:"Server error..!"})
    }
}


const ReturnOrder = async(req,res)=>{
    try {
        const orderId = req.params.orderId;
        console.log("od id",orderId)
        const order = await Order.findById(orderId)

        const deliverDate = order.deleiverdDate;
        const currentDate = new Date()
        const expectedDate = new Date(deliverDate);
        expectedDate.setDate(expectedDate.getDate()+10)

        console.log("deliver date ",deliverDate );
        console.log("current date ",currentDate );
        console.log("expectedDat ",expectedDate );

        if(currentDate <= expectedDate){
            res.status(200).json({success:true,message:"Return Order Request Confirmed..!"})

            order.orderStatus = "Returned"
            await order.save()
            console.log("Return Order Request Success.")
        }
        else{
            res.status(400).json({success:false,message:"Unfortunately The Return Period Has Expired..!"})
        }
    } catch (error) {
        console.error("Error in Return ORder Request..",error);
        res.status(500).json({message:"Server Error..!"})
    }
}




module.exports ={
    orderDetails,
    orderCancel,
    ReturnOrder
}