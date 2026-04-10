'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { UserPlus, ArrowLeft, Shield, User, Trash2, Mail, Fingerprint, Edit3, X } from 'lucide-react'
import Link from 'next/link'

// 1. DEFINIMOS A URL BASE FORA DO COMPONENTE
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function AdminUsuarios() {
  const [users, setUsers] = useState([])
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // States do formulário
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [role, setRole] = useState('USER')
  
  const router = useRouter()
  const userIdLogado = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`)
      setUsers(res.data)
    } catch (err) { console.error("Erro ao carregar usuários", err) }
  }

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'ADMIN') {
      router.push('/')
    } else {
      fetchUsers()
    }
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setNome('')
    setEmail('')
    setSenha('')
    setRole('USER')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        // Lógica de EDIÇÃO (PATCH)
        await axios.patch(`${API_URL}/users/${editingId}`, { nome, email, role, ...(senha && { senha }) })
        alert("Usuário atualizado!")
      } else {
        // Lógica de CRIAÇÃO (POST)
        await axios.post(`${API_URL}/users`, { nome, email, senha, role })
        alert("Usuário criado!")
      }
      resetForm()
      fetchUsers()
    } catch (err) { alert("Erro ao processar solicitação.") }
  }

  const handleEditClick = (u: any) => {
    setEditingId(u.id)
    setNome(u.nome)
    setEmail(u.email)
    setRole(u.role)
    setSenha('') // Senha fica limpa por segurança na edição
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (id === Number(userIdLogado)) return alert("Você não pode se auto-excluir!")
    if (!confirm("Deseja realmente remover este acesso?")) return
    try {
      await axios.delete(`${API_URL}/users/${id}`)
      fetchUsers()
    } catch (err) { alert("Erro ao excluir usuário.") }
  }

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-500 mb-8 transition-colors font-bold uppercase text-[10px] tracking-widest">
          <ArrowLeft size={16} /> Voltar para o Painel
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORMULÁRIO (DUPLA FUNÇÃO: CRIAR E EDITAR) */}
          <div className="lg:col-span-1">
            <div className={`bg-slate-900 border ${editingId ? 'border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'border-slate-800'} rounded-[2rem] p-8 sticky top-8 transition-all`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black italic uppercase flex items-center gap-2">
                  {editingId ? <Edit3 className="text-orange-500" size={20}/> : <UserPlus className="text-blue-500" size={20}/>}
                  {editingId ? 'Editar Acesso' : 'Novo Acesso'}
                </h2>
                {editingId && (
                  <button onClick={resetForm} className="text-slate-500 hover:text-white"><X size={18}/></button>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <input placeholder="Nome" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" value={nome} onChange={(e) => setNome(e.target.value)} />
                <input placeholder="E-mail" type="email" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input 
                  placeholder={editingId ? "Senha (deixe vazio p/ manter)" : "Senha"} 
                  type="password" 
                  required={!editingId}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" 
                  value={senha} onChange={(e) => setSenha(e.target.value)} 
                />
                
                <div className="flex gap-2">
                  <button type="button" onClick={() => setRole('USER')} className={`flex-1 py-2 rounded-xl text-[10px] font-black border transition-all ${role === 'USER' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>USUÁRIO</button>
                  <button type="button" onClick={() => setRole('ADMIN')} className={`flex-1 py-2 rounded-xl text-[10px] font-black border transition-all ${role === 'ADMIN' ? 'bg-red-600 border-red-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>ADMIN</button>
                </div>

                <button type="submit" className={`w-full font-black py-4 rounded-xl transition-all text-xs uppercase italic mt-4 ${editingId ? 'bg-orange-500 text-white' : 'bg-white text-black hover:bg-blue-500 hover:text-white'}`}>
                  {editingId ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </form>
            </div>
          </div>

          {/* LISTAGEM COM BOTÃO DE EDITAR */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2 ml-4">
               Equipe Ativa ({users.length})
            </h2>
            
            {users.map((u: any) => (
              <div key={u.id} className={`bg-slate-900 border p-6 rounded-[1.5rem] flex items-center justify-between group transition-all ${editingId === u.id ? 'border-orange-500 ring-1 ring-orange-500/50' : 'border-slate-800 hover:border-slate-600'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black border-2 ${u.role === 'ADMIN' ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-blue-500/50 bg-blue-500/10 text-blue-500'}`}>
                    {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover rounded-lg" /> : u.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white uppercase text-sm flex items-center gap-2">
                      {u.nome} {u.role === 'ADMIN' && <Shield size={12} className="text-red-500" />}
                    </h3>
                    <span className="text-slate-500 text-[10px] block">{u.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                      onClick={() => handleEditClick(u)}
                      className="p-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-orange-500 hover:text-white transition-all"
                      title="Editar Usuário"
                    >
                      <Edit3 size={18} />
                    </button>
                   {u.id !== Number(userIdLogado) && (
                     <button 
                      onClick={() => handleDelete(u.id)}
                      className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      title="Excluir Usuário"
                    >
                      <Trash2 size={18} />
                    </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}