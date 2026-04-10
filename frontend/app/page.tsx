'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, X, Ticket, AlertCircle, Clock, CheckCircle2, RotateCcw, MessageSquare, Users, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// 1. DEFINIMOS A URL BASE DINÂMICA
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Home() {
  const [tickets, setTickets] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [filtroAtivo, setFiltroAtivo] = useState('TODOS')
  const router = useRouter()
  
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState('BAIXA')

  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : 'USER'

  const fetchTickets = () => {
    // 2. BUSCA DE TICKETS COM API_URL
    axios.get(`${API_URL}/tickets`)
      .then(res => setTickets(res.data))
      .catch(err => console.error(err))
  }

  const fetchUserData = (id: string) => {
    // 3. BUSCA DE DADOS DO USUÁRIO COM API_URL
    axios.get(`${API_URL}/users/${id}`)
      .then(res => {
        if (res.data.avatar) setAvatarUrl(res.data.avatar)
      })
      .catch(err => console.error("Erro ao buscar dados do usuário", err))
  }

  useEffect(() => {
    const name = localStorage.getItem('user_name')
    if (!name || !userId) {
      router.push('/login')
    } else {
      setUserName(name)
      fetchTickets()
      fetchUserData(userId)
      const interval = setInterval(fetchTickets, 5000)
      return () => clearInterval(interval)
    }
  }, [])

  const handleLogout = () => { localStorage.clear(); router.push('/login'); }
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      setAvatarUrl(base64)
      try { 
        // 4. ATUALIZAÇÃO DE AVATAR COM API_URL
        await axios.patch(`${API_URL}/users/${userId}`, { avatar: base64 }) 
      } catch (err) { console.error(err) }
    }
    reader.readAsDataURL(file)
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // 5. CRIAÇÃO DE TICKET COM API_URL
      await axios.post(`${API_URL}/post/tickets`, { titulo, descricao, prioridade, clienteId: Number(userId) })
      setTitulo(''); setDescricao(''); setIsModalOpen(false); fetchTickets() 
    } catch (err) { alert("Erro ao criar") }
  }

  const ticketsDoUsuario = tickets.filter((t: any) => userRole === 'ADMIN' || t.clienteId === Number(userId))
  
  const ticketsFiltrados = ticketsDoUsuario.filter((t: any) => {
    if (filtroAtivo === 'ABERTOS') return t.status !== 'FECHADO'
    if (filtroAtivo === 'CRITICOS') return t.prioridade === 'ALTA' && t.status !== 'FECHADO'
    if (filtroAtivo === 'CONCLUIDOS') return t.status === 'FECHADO'
    return true
  })

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100 font-sans relative">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black text-white flex items-center gap-3 italic tracking-tighter">
              <Ticket className="text-blue-500" size={40} /> NEO-GLPI
            </h1>
            <p className="text-slate-400 mt-1 uppercase text-[10px] tracking-[0.2em] font-bold">Salto Veloso, SC</p>
          </div>
          <div className="flex items-center gap-6">
            
            {userRole === 'ADMIN' && (
              <Link href="/admin/usuarios">
                <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
                  <Users size={16} /> Equipe
                </button>
              </Link>
            )}

             <div className="flex items-center gap-4 bg-slate-900/50 p-2 pr-4 rounded-2xl border border-slate-800">
              <label className="relative group cursor-pointer w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border-2 border-blue-500/30">
                {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-blue-500/10 text-blue-500 font-black">{userName.charAt(0)}</div>}
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
              <div className="text-right"><p className="text-sm font-bold">{userName}</p><button onClick={handleLogout} className="text-[10px] text-red-500 font-bold uppercase">Sair</button></div>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl active:scale-95"><Plus size={20} /> NOVO</button>
          </div>
        </header>

        {/* INDICADORES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div onClick={() => setFiltroAtivo('TODOS')} className={`cursor-pointer p-4 rounded-2xl border transition-all ${filtroAtivo === 'TODOS' ? 'bg-slate-800 border-blue-500 shadow-lg' : 'bg-slate-900/50 border-slate-800'}`}>
            <div className="flex items-center gap-4">
              <div className="bg-slate-700 p-3 rounded-xl"><RotateCcw size={20}/></div>
              <div><p className="text-2xl font-black leading-none">{ticketsDoUsuario.length}</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Geral</p></div>
            </div>
          </div>
          <div onClick={() => setFiltroAtivo('ABERTOS')} className={`cursor-pointer p-4 rounded-2xl border transition-all ${filtroAtivo === 'ABERTOS' ? 'bg-blue-500/10 border-blue-500' : 'bg-slate-900/50 border-slate-800'}`}>
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500"><Clock size={20}/></div>
              <div><p className="text-2xl font-black leading-none">{ticketsDoUsuario.filter((t: any) => t.status !== 'FECHADO').length}</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Abertos</p></div>
            </div>
          </div>
          <div onClick={() => setFiltroAtivo('CRITICOS')} className={`cursor-pointer p-4 rounded-2xl border transition-all ${filtroAtivo === 'CRITICOS' ? 'bg-red-500/10 border-red-500' : 'bg-slate-900/50 border-slate-800'}`}>
            <div className="flex items-center gap-4">
              <div className="bg-red-500/10 p-3 rounded-xl text-red-500"><AlertCircle size={20}/></div>
              <div><p className="text-2xl font-black leading-none text-red-500">{ticketsDoUsuario.filter((t: any) => t.prioridade === 'ALTA' && t.status !== 'FECHADO').length}</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Críticos</p></div>
            </div>
          </div>
          <div onClick={() => setFiltroAtivo('CONCLUIDOS')} className={`cursor-pointer p-4 rounded-2xl border transition-all ${filtroAtivo === 'CONCLUIDOS' ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-900/50 border-slate-800'}`}>
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500"><CheckCircle2 size={20}/></div>
              <div><p className="text-2xl font-black leading-none">{ticketsDoUsuario.filter((t: any) => t.status === 'FECHADO').length}</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Concluídos</p></div>
            </div>
          </div>
        </div>

        {/* LISTAGEM */}
        <div className="grid gap-4">
          {ticketsFiltrados.map((ticket: any) => {
            const mensagens = ticket.messages || [];
            const ultimaMsg = mensagens.length > 0 ? mensagens[mensagens.length - 1] : null;
            const temNovidade = ultimaMsg && String(ultimaMsg.autorId) !== String(userId) && ticket.status !== 'FECHADO';

            let cardStyle = "bg-slate-900 border-slate-800"; 
            if (ticket.status === 'FECHADO' && ticket.avaliacao) {
              cardStyle = "bg-emerald-500/5 border-emerald-500/30";
            } else if (temNovidade) {
              cardStyle = "bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50"; 
            }

            return (
              <Link href={`/tickets/${ticket.id}`} key={ticket.id} className="block group">
                <div className={`${cardStyle} border-l-4 p-6 rounded-2xl hover:brightness-110 transition-all cursor-pointer relative overflow-hidden ${ticket.status === 'REABERTO' ? 'border-l-orange-500' : ticket.prioridade === 'ALTA' ? 'border-l-red-600' : 'border-l-blue-500'}`}>
                  
                  {temNovidade && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-blue-600 text-[8px] font-black px-3 py-1.5 rounded-full animate-bounce shadow-lg shadow-blue-500/40 z-10">
                      <MessageSquare size={10} fill="white"/> NOVA RESPOSTA
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <h2 className={`text-xl font-bold uppercase tracking-tight ${temNovidade ? 'text-blue-400' : 'text-white'}`}>{ticket.titulo}</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <User size={10}/> {ticket.cliente?.nome || 'Usuário'}
                        </span>
                        {ticket.clienteId === Number(userId) && (
                          <span className="bg-blue-500/10 text-blue-500 text-[8px] font-bold px-2 py-0.5 rounded-md border border-blue-500/20">MEU</span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 bg-black/20`}>{ticket.status}</span>
                  </div>
                  
                  <p className="text-slate-400 text-sm mb-4 line-clamp-1 italic">"{ticket.descricao}"</p>
                  
                  <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-white/5 pt-4 font-bold uppercase">
                    <div className="flex gap-4">
                      <span>Prioridade: <span className={ticket.prioridade === 'ALTA' ? 'text-red-500' : 'text-slate-300'}>{ticket.prioridade}</span></span>
                      {ticket.avaliacao && <span className="text-yellow-500">Nota: {ticket.avaliacao} ★</span>}
                    </div>
                    <span className="text-blue-500 group-hover:translate-x-1 transition-transform font-black">
                      {temNovidade ? 'RESPONDER →' : 'ABRIR CHAT →'}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={24} /></button>
            <h2 className="text-3xl font-black mb-6 text-white italic uppercase leading-none">Novo<br/>Chamado</h2>
            <form onSubmit={handleCreateTicket} className="space-y-6">
              <input placeholder="O que está acontecendo?" required className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-white outline-none focus:border-blue-500" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              <textarea placeholder="Explique os detalhes..." required rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-white outline-none focus:border-blue-500" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Prioridade</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-white outline-none appearance-none cursor-pointer" value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
                  <option value="BAIXA">BAIXA</option>
                  <option value="MEDIA">MÉDIA</option>
                  <option value="ALTA">ALTA</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 uppercase italic">Enviar Chamado</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}