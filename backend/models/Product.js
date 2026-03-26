const fetchProducts=async()=>{
    const res=await fetch("http://localhost:5000/api/products/SHOP_ID");
    const data=await res.json();
    setProducts(data);
};
useEffect(()=>{
    fetchProducts();
},[]);
