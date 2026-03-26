const express=require("express");
const router=express.Router();
const {getProducts,addProduct}=require("../controllers/productController");
router.get("/:shopId",getProducts);
router.post("/add",addProduct);
module.exports=router;
