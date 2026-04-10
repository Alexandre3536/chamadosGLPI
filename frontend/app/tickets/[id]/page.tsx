'use client'
import { useEffect, useState, use, useRef } from 'react'
import axios from 'axios'
import { ArrowLeft, Send, CheckCircle, Plus, X, Star, RotateCcw, FileText, Download } from 'lucide-react'
import Link from 'next/link'

export default function TicketDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [ticket, setTicket] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [imageAnexo, setImageAnexo] = useState<string | null>(null)
  const [hoverEstrelas, setHoverEstrelas] = useState(0)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : 'USER'

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  const handleScroll = () => {
    if (!chatContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150
    setIsAutoScrollEnabled(isAtBottom)
  }

  const loadData = async (forceScroll = false) => {
    try {
      const ticketRes = await axios.get(`http://localhost:3000/tickets`) 
      const currentTicket = ticketRes.data.find((t: any) => Number(t.id) === Number(id))
      setTicket(currentTicket)

      const msgRes = await axios.get(`http://localhost:3000/messages/ticket/${id}`)
      
      setMessages(prev => {
        const hasNew = msgRes.data.length > prev.length
        if (forceScroll) {
          setTimeout(() => scrollToBottom('auto'), 100)
        } else if (hasNew && isAutoScrollEnabled) {
          setTimeout(() => scrollToBottom('smooth'), 100)
        }
        return msgRes.data
      })
    } catch (err) { console.error("Erro ao carregar dados", err) }
  }

  useEffect(() => {
    loadData(true)
    const interval = setInterval(() => { loadData(false) }, 3000)
    return () => clearInterval(interval)
  }, [id])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as any)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => { setImageAnexo(reader.result as string) }
    reader.readAsDataURL(file)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newMessage.trim() && !imageAnexo) return
    try {
      await axios.post('http://localhost:3000/messages', {
        texto: newMessage, imagem: imageAnexo, ticketId: Number(id), autorId: Number(userId) 
      })
      setNewMessage(''); setImageAnexo(null)
      await loadData(false) 
      scrollToBottom('smooth') 
    } catch (err) { alert("Erro ao enviar") }
  }

  // FUNÇÃO DE AVALIAÇÃO CORRIGIDA
  const handleAvaliar = async (estrelas: number) => {
    try {
      await axios.patch(`http://localhost:3000/tickets/${id}`, { 
        avaliacao: Number(estrelas), 
        status: 'FECHADO' 
      })
      // Atualiza localmente para o usuário ver o brilho das estrelas na hora
      setTicket((prev: any) => ({ ...prev, avaliacao: estrelas }))
      await loadData(false)
    } catch (err) { alert("Erro ao salvar avaliação") }
  }

  const handleReabrir = async () => {
    if(!confirm("Deseja reabrir este chamado?")) return
    try {
      await axios.patch(`http://localhost:3000/tickets/${id}`, { status: 'REABERTO', avaliacao: null })
      loadData()
    } catch (err) { alert("Erro ao reabrir") }
  }

  const handleCloseTicket = async () => {
    if (!confirm("Encerrar chamado?")) return
    try {
      await axios.patch(`http://localhost:3000/tickets/${id}`, { status: 'FECHADO' })
      loadData()
    } catch (err) { alert("Erro ao fechar") }
  }

  if (!ticket) return <div className="p-8 text-white bg-slate-950 min-h-screen text-center font-bold italic uppercase">CARREGANDO...</div>

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-800 rounded-full text-blue-500 transition-colors"><ArrowLeft size={24} /></Link>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tight">{ticket.titulo}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              ID #{id} | <span className={ticket.status === 'REABERTO' ? 'text-orange-500' : 'text-blue-500'}>{ticket.status}</span>
            </p>
          </div>
        </div>
        {ticket.status !== 'FECHADO' && (
          <button onClick={handleCloseTicket} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 border border-red-500/20">
            <CheckCircle size={16} /> Encerrar
          </button>
        )}
      </header>

      <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 italic text-slate-500 text-sm mb-8">" {ticket.descricao} "</div>

        {messages.map((msg) => {
          const isMe = Number(msg.autorId) === Number(userId);
          const isPDF = msg.imagem?.includes("application/pdf") || msg.imagem?.includes("data:application/pdf");
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-4 rounded-2xl shadow-2xl ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                {msg.texto && <p className="text-sm font-medium leading-relaxed mb-2 whitespace-pre-wrap">{msg.texto}</p>}
                {msg.imagem && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-black/10">
                    {isPDF ? (
                      <div className="bg-slate-900 p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-red-400"><FileText size={20} /><span className="text-[10px] font-bold uppercase">PDF</span></div>
                        <a href={msg.imagem} download={`anexo_${msg.id}.pdf`} className="p-2 bg-slate-700 hover:bg-blue-500 rounded-lg transition-colors"><Download size={16} /></a>
                      </div>
                    ) : (
                      <img src={msg.imagem} alt="Anexo" className="w-full h-auto cursor-pointer" onClick={() => window.open(msg.imagem)} />
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center mt-2 opacity-40 text-[9px] font-black uppercase">
                  <span>{isMe ? 'VOCÊ' : (msg.autor?.nome || 'SUPORTE')}</span>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      <div className="p-6 bg-slate-900 border-t border-slate-800">
        {ticket.status !== 'FECHADO' ? (
          <div className="max-w-4xl mx-auto">
            {imageAnexo && (
              <div className="relative inline-block mb-4 p-2 bg-slate-800 rounded-xl border border-blue-500">
                {imageAnexo.includes("pdf") ? <FileText className="text-red-500" size={40} /> : <img src={imageAnexo} className="h-20 w-20 object-cover rounded-lg" />}
                <button onClick={() => setImageAnexo(null)} className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full text-white"><X size={12} /></button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
              <label className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl cursor-pointer text-slate-400 border border-slate-700 transition-colors"><Plus size={24} /><input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} /></label>
              <textarea rows={1} className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500 text-white" placeholder="Digite sua resposta..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown} />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl text-white transition-all shadow-lg active:scale-95 disabled:opacity-50" disabled={!newMessage.trim() && !imageAnexo}><Send size={24} /></button>
            </form>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center space-y-4 py-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Avaliação do Atendimento</h3>
            {userRole !== 'ADMIN' && !ticket.avaliacao ? (
              <div className="bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={36} onClick={() => handleAvaliar(s)} onMouseEnter={() => setHoverEstrelas(s)} onMouseLeave={() => setHoverEstrelas(0)} className={`cursor-pointer transition-all ${ (hoverEstrelas || 0) >= s ? 'fill-yellow-500 text-yellow-500 scale-110' : 'text-slate-600' }`} />
                  ))}
                </div>
                <button onClick={handleReabrir} className="text-[9px] font-black uppercase text-red-500 hover:bg-red-500/10 px-6 py-3 rounded-2xl flex items-center gap-2 mx-auto transition-all border border-transparent hover:border-red-500/20"><RotateCcw size={14} /> Não resolvido? Reabrir</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                {ticket.avaliacao ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (<Star key={i} size={20} className={i <= ticket.avaliacao ? "fill-yellow-500 text-yellow-500" : "text-slate-800"} />))}
                    </div>
                    <p className="text-emerald-500 font-black text-[10px] uppercase tracking-widest italic tracking-widest">Atendimento nota {ticket.avaliacao}!</p>
                  </div>
                ) : (
                  <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Aguardando avaliação do cliente...</p>
                )}
                <button onClick={handleReabrir} className="mt-4 text-[9px] font-black uppercase text-red-500 opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2"><RotateCcw size={12}/> Reabrir Chamado</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}