const Shop=require("../models/Shop");
exports.registerShop=async(req,res)=>{
    const shop=new Shop(req.body);
    await shop.save();
    res.json({message:"Registered"});
};
exports.loginShop=async(req,res)=>{
    const shop=await Shop.findOne({
        email:req.body.email,
        password:req.body.password
    });
    res.json(shop);
};
