'use client'

import { useEffect,useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest(){
  const [rows,setRows]=useState<any[]>([])
  const [msg,setMsg]=useState('')

  async function addData(){
    const { data,error } = await supabase
      .from('test_connection')
      .insert([{ name:'Hello from VyapaarPro' }])
      .select()

    console.log('INSERT RESULT:',data,error)

    if(error){
      setMsg('Error: '+error.message)
      return
    }

    setMsg('Inserted successfully!')
    loadData()
  }

  async function loadData(){
    const { data,error } = await supabase
      .from('test_connection')
      .select('*')

    console.log('FETCH RESULT:',data,error)

    if(error){
      setMsg('Fetch error: '+error.message)
      return
    }

    setRows(data||[])
  }

  useEffect(()=>{
    loadData()
  },[])

  return (
    <div style={{padding:20}}>
      <h2>Supabase Test</h2>

      <button onClick={addData}>Send Data</button>

      <p>{msg}</p>

      {rows.map(r=>(
        <p key={r.id}>{r.name}</p>
      ))}
    </div>
  )
}
