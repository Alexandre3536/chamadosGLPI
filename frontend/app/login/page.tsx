'use client'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Ticket } from 'lucide-react'

// 1. DEFINIMOS A URL BASE (Igual fizemos no AdminUsuarios)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // 2. TROCAMOS O LINK FIXO PELA VARIÁVEL DINÂMICA
      const res = await axios.post(`${API_URL}/users/login`, { email, senha })
      
      // PERSISTÊNCIA DOS DADOS
      localStorage.setItem('user_name', res.data.nome)
      localStorage.setItem('user_id', String(res.data.id))
      localStorage.setItem('user_role', res.data.role)

      router.push('/') 
    } catch (err) {
      console.error(err)
      alert("E-mail ou senha incorretos!")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-900/40">
            <Ticket className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tighter italic">NEO-GLPI</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Prefeitura de Salto Veloso</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">E-mail Institucional</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm transition-all"
                placeholder="nome@salto-veloso.sc.gov.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm transition-all"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/20 mt-6 active:scale-[0.98] uppercase text-sm tracking-widest"
          >
            Entrar no Sistema
          </button>
        </form>

        <p className="text-center text-slate-600 text-[9px] mt-8 font-bold uppercase tracking-widest">
          Tecnologia da Informação &copy; 2026
        </p>
      </div>
    </div>
  )
}