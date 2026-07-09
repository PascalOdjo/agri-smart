import { supabase } from '../lib/supabase.js'

export async function saveDiagnostic({ userId, imageUrl, disease_name, severity, solution, eco_alternative }) {

  console.log("USER ID:", userId)
  console.log("IMAGE URL:", imageUrl)

  const { data, error } = await supabase
    .from('diagnostics')
    .insert({
      user_id: userId,
      image_url: imageUrl,
      disease_name,
      severity,
      solution,
      eco_alternative,
    })
    .select('id')
    .single()


    console.log("DATA:", data)
    console.log("ERROR:", error)
  if (error){
    console.error("SUPABASE ERROR:", error)
    throw error
  }
  return data
  // if (error) throw error
  // return data
}

export async function getDiagnosticsByUser(userId) {
  const { data, error } = await supabase
    .from('diagnostics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getDiagnosticById(id, userId) {
  const { data, error } = await supabase
    .from('diagnostics')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data
}
