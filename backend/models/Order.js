
await fetch("http://localhost:5000/api/orders/place",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(orderData)
});
