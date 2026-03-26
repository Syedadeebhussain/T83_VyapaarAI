const express=require("express");
const router=express.Router();
const {placeOrder,getOrder}=require("../controllers/orderController");
router.post("/place",placeOrder);
router.get("/:id",getOrder);
module.exports=router;
