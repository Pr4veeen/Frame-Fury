const User = require("../../models/userSchema");
const mongoose =require("mongoose");
const bcrypt = require("bcrypt");


const pageerror = async(req,res)=>{
    res.render("admin-error")
}

const loadLogin = async(req,res)=>{
    if(req.session.admin){
        return res.redirect("/admin")
    }
    res.render("admin-login",{message:null})
}

const login = async(req,res)=>{
    try {
        const {email,password} = req.body;
        const admin =await User.findOne({email,isAdmin:true})
        if(admin){
             const passwordMatch = bcrypt.compare(password,admin.password);
             
             if(passwordMatch){
                req.session.admin = true;
                return res.redirect("/admin")
             }else{
                return res.redirect("/login")
             }        
        }else{
            return res.redirect("/login")
        }
    } catch (error) {
        console.log("Login error");
        return res.redirect("/pageerror"); 
    }
}

const loadDashboard = async(req,res)=>{
    if(req.session.admin){
        try {
            res.render("dashboard")
        } catch (error) {
           res.redirect("/pageerror") 
        }
    }
}

const logout = async(req,res)=>{
    try {
        req.session.destroy(err=>{
            if(err){
                console.log("Error destroying session");
                return res.redirect("/pageerror")
            }
            res.redirect("/admin/login")
        })
    } catch (error) {
        console.log("unexpected error during Admin logout",error);
        res.redirect("/pageerror")
    }
}




module.exports = {
    loadLogin,
    login,
    loadDashboard,
    pageerror,
    logout
}