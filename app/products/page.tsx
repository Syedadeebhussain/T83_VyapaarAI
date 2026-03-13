'use client'

import { useEffect,useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProductsPage(){
  const [name,setName]=useState('')
  const [price,setPrice]=useState('')
  const [stock,setStock]=useState('')
  const [products,setProducts]=useState<any[]>([])
  const [msg,setMsg]=useState('')

  async function addProduct(){
    if(!name)return

    // find product safely
    const { data:existing,error:findError }=await supabase
      .from('products')
      .select('*')
      .ilike('name',name.trim())
      .limit(1)

    if(findError){
      setMsg(findError.message)
      return
    }

    if(existing && existing.length>0){
      const item=existing[0]
      const newStock=(item.stock||0)+Number(stock||0)

      const { error }=await supabase
        .from('products')
        .update({
          price:Number(price)||item.price,
          stock:newStock
        })
        .eq('id',item.id)

      if(error){
        setMsg(error.message)
        return
      }

      setMsg('Updated existing product!')
    }else{
      const { error }=await supabase
        .from('products')
        .insert([{
          name:name.trim(),
          price:Number(price),
          stock:Number(stock)
        }])

      if(error){
        setMsg(error.message)
        return
      }

      setMsg('Inserted new product!')
    }

    setName('')
    setPrice('')
    setStock('')
    loadProducts()
  }


  async function loadProducts(){
    const { data,error }=await supabase
      .from('products')
      .select('*')
      .order('id',{ ascending:false })

    if(error){
      setMsg(error.message)
      return
    }

    setProducts(data||[])
  }

  useEffect(()=>{
    loadProducts()
  },[])

  return (
    <div style={{padding:20}}>
      <h2>Products</h2>

      <input
        placeholder="Product name"
        value={name}
        onChange={e=>setName(e.target.value)}
      />

      <input
        placeholder="Price"
        value={price}
        onChange={e=>setPrice(e.target.value)}
      />

      <input
        placeholder="Stock qty"
        value={stock}
        onChange={e=>setStock(e.target.value)}
      />

      <button onClick={addProduct}>
        Add Product
      </button>

      <p>{msg}</p>

      <hr/>

      {products.map(p=>(
        <div key={p.id}>
          {p.name} — ₹{p.price} — Stock: {p.stock}
        </div>
      ))}
    </div>
  )
}
