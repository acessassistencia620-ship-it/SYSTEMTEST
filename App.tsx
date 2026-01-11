
import React, { useState, useEffect } from 'react';
import { QuoteItem, ClientInfo, MARGIN_BASE, CREDIT_CARD_TAX } from './types';
import { formatCurrency, calculateSubtotal } from './utils/formatters';
import Button from './components/Button';

const STORAGE_KEY_ITEMS = 'klsinformatica_items';
const STORAGE_KEY_CLIENT = 'klsinformatica_client';

const App: React.FC = () => {
  const [items, setItems] = useState<QuoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  
  const [client, setClient] = useState<ClientInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLIENT);
      return saved ? JSON.parse(saved) : {
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      };
    } catch (e) {
      return { name: '', email: '', phone: '', address: '', notes: '' };
    }
  });

  const [newItem, setNewItem] = useState<Omit<QuoteItem, 'id'>>({
    description: '',
    quantity: 1,
    unitPrice: 0
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLIENT, JSON.stringify(client));
  }, [client]);

  const rawTotal = items.reduce((acc, item) => acc + calculateSubtotal(item.quantity, item.unitPrice), 0);
  const totalWithMargin = rawTotal * (1 + MARGIN_BASE);
  const totalWithCreditCard = rawTotal * (1 + CREDIT_CARD_TAX);

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItem.description.trim()) {
      alert("⚠️ Digite a descrição do produto/serviço.");
      document.getElementById('item-desc')?.focus();
      return;
    }
    if (newItem.unitPrice <= 0) {
      alert("⚠️ O preço deve ser maior que zero.");
      return;
    }
    const item: QuoteItem = {
      ...newItem,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    };
    setItems(prev => [...prev, item]);
    setNewItem({ description: '', quantity: 1, unitPrice: 0 });
    setTimeout(() => document.getElementById('item-desc')?.focus(), 10);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddItem();
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("🚨 Deseja apagar todos os dados do orçamento?")) {
      setItems([]);
      setClient({ name: '', email: '', phone: '', address: '', notes: '' });
      localStorage.removeItem(STORAGE_KEY_ITEMS);
      localStorage.removeItem(STORAGE_KEY_CLIENT);
    }
  };

  const handlePrint = () => {
    if (items.length === 0) {
      alert("⚠️ Adicione itens antes de imprimir.");
      return;
    }
    window.print();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto pb-20 bg-black text-white">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-orange-600 p-3 rounded-2xl text-white shadow-xl shadow-orange-900/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
          </div>
          <div>
            <h1 className="text-4xl font-black text-orange-500 tracking-tighter">KLSINFORMATICA</h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">Soluções Digitais & Orçamentos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleClearAll}>
            Limpar
          </Button>
          <Button onClick={handlePrint} className="bg-orange-600 hover:bg-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Imprimir
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6 no-print">
          {/* Client Info Section */}
          <section className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-2xl">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-orange-500 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Dados do Cliente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Nome completo</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-white placeholder-zinc-700"
                  value={client.name}
                  onChange={e => setClient({...client, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Telefone</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-white placeholder-zinc-700"
                  value={client.phone}
                  onChange={e => setClient({...client, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">E-mail</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-white placeholder-zinc-700"
                  value={client.email}
                  onChange={e => setClient({...client, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Endereço</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-white placeholder-zinc-700"
                  value={client.address}
                  onChange={e => setClient({...client, address: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* Add Item Section */}
          <section className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-2xl">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-orange-500 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              Novo Item
            </h2>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow w-full space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Descrição</label>
                <input 
                  id="item-desc"
                  type="text" 
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white"
                  value={newItem.description}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                  onKeyDown={handleKeyPress}
                />
              </div>
              <div className="w-full md:w-24 space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Qtd</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white text-center"
                  value={newItem.quantity}
                  onChange={e => setNewItem({...newItem, quantity: Math.max(1, Number(e.target.value))})}
                  onKeyDown={handleKeyPress}
                />
              </div>
              <div className="w-full md:w-40 space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Valor Unit.</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-orange-500 font-black text-sm">R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 bg-black border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white"
                    value={newItem.unitPrice || ''}
                    onChange={e => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                    onKeyDown={handleKeyPress}
                  />
                </div>
              </div>
              <Button onClick={() => handleAddItem()} className="w-full md:w-auto px-8 h-[52px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add
              </Button>
            </div>
          </section>

          {/* Table List */}
          <section className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-zinc-800/50 border-b border-zinc-800 flex justify-between items-center">
               <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Itens Listados</h3>
               <span className="bg-orange-600/10 text-orange-500 text-[10px] font-black px-3 py-1 rounded-full border border-orange-500/20">{items.length} ITENS</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-800/20">
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Descrição</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Qtd</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Unitário</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Subtotal</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <p className="font-bold text-zinc-600 uppercase text-xs tracking-[0.2em]">Carrinho vazio</p>
                      </td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <tr key={item.id} className="group hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-sm text-zinc-100">{item.description}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-orange-500 font-black text-xs">x{item.quantity}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400 font-medium">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-6 py-4 text-right font-black text-white">{formatCurrency(calculateSubtotal(item.quantity, item.unitPrice))}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleRemoveItem(item.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4">
          <section className="bg-zinc-900 text-white p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl space-y-8 sticky top-8">
            <h2 className="text-xl font-black border-b border-zinc-800 pb-6 flex items-center gap-3 text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              RESUMO
            </h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center text-zinc-500 font-black uppercase text-[10px] tracking-widest px-2">
                <span>Bruto</span>
                <span className="text-zinc-200 text-sm">{formatCurrency(rawTotal)}</span>
              </div>
              
              <div className="relative p-6 bg-black rounded-3xl border border-zinc-800 shadow-lg">
                <div className="absolute top-0 left-0 w-2 h-full bg-orange-600 rounded-l-full"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">À VISTA / PIX</span>
                  <span className="bg-orange-600 text-white text-[8px] px-2 py-0.5 rounded-full font-black">22% MARGEM</span>
                </div>
                <div className="text-4xl font-black text-white tracking-tighter">{formatCurrency(totalWithMargin)}</div>
                <p className="text-[9px] text-zinc-600 mt-3 font-bold uppercase italic">Condição preferencial KLS</p>
              </div>

              <div className="relative p-6 bg-black rounded-3xl border border-zinc-800 shadow-lg">
                <div className="absolute top-0 left-0 w-2 h-full bg-zinc-700 rounded-l-full"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">CARTÃO CRÉDITO</span>
                  <span className="bg-zinc-800 text-zinc-400 text-[8px] px-2 py-0.5 rounded-full font-black">24% TAXAS</span>
                </div>
                <div className="text-3xl font-black text-white tracking-tighter opacity-80">{formatCurrency(totalWithCreditCard)}</div>
                <p className="text-[9px] text-zinc-600 mt-3 font-bold uppercase italic">Parcelamento via operadora</p>
              </div>
            </div>

            <div className="pt-4 space-y-3 no-print">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Notas Adicionais</label>
              <textarea 
                className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-orange-500 outline-none text-white resize-none min-h-[120px]"
                placeholder="Ex: Validade, garantia, termos..."
                value={client.notes}
                onChange={e => setClient({...client, notes: e.target.value})}
              ></textarea>
            </div>

            <Button className="w-full py-6 text-xl bg-orange-600 hover:bg-orange-500 shadow-orange-900/40 rounded-[1.5rem]" onClick={handlePrint}>
              GERAR PROPOSTA
            </Button>
          </section>
        </div>
      </div>

      {/* PRINT VERSION */}
      <div className="hidden print-only fixed inset-0 z-50 bg-white p-12 text-black overflow-y-auto">
        <div className="flex justify-between items-start border-b-8 border-orange-600 pb-8 mb-12">
          <div>
            <h1 className="text-6xl font-black text-black mb-2 tracking-tighter uppercase">Orçamento</h1>
            <div className="flex gap-4">
              <span className="bg-black text-white px-4 py-1.5 text-xs font-black uppercase tracking-widest">KLSINFORMATICA</span>
              <span className="text-zinc-400 font-black uppercase tracking-[0.2em] text-xs self-center">Proposta de Serviços</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-black text-4xl mb-1 tracking-tighter">KLS</p>
            <p className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Emitido: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="mb-12 bg-zinc-50 p-8 rounded-3xl border border-zinc-200">
          <h3 className="text-[10px] font-black text-orange-600 uppercase mb-6 border-b border-orange-100 pb-2 tracking-[0.2em]">Dados do Cliente</h3>
          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase mb-2">Cliente / Razão</p>
              <p className="text-2xl font-black text-black leading-tight">{client.name || 'Consumidor Final'}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase mb-2">Telefone</p>
              <p className="text-xl font-bold text-zinc-800">{client.phone || '-'}</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-zinc-100 grid grid-cols-2 gap-12">
             <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase mb-2">Endereço de Serviço</p>
                <p className="text-sm font-medium text-zinc-600">{client.address || '-'}</p>
             </div>
             <div>
                <p className="text-[9px] font-black text-zinc-400 uppercase mb-2">E-mail</p>
                <p className="text-sm font-medium text-zinc-600 italic">{client.email || '-'}</p>
             </div>
          </div>
        </div>

        <table className="w-full mb-12 border-collapse">
          <thead>
            <tr className="border-b-4 border-black">
              <th className="py-5 text-left font-black uppercase text-xs tracking-widest text-zinc-400">Descrição Detalhada</th>
              <th className="py-5 text-center font-black uppercase text-xs tracking-widest text-zinc-400">Qtd</th>
              <th className="py-5 text-right font-black uppercase text-xs tracking-widest text-zinc-400">Preço Unit.</th>
              <th className="py-5 text-right font-black uppercase text-xs tracking-widest text-zinc-400">Total Item</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {items.map(item => (
              <tr key={item.id}>
                <td className="py-6 font-black text-xl text-black">{item.description}</td>
                <td className="py-6 text-center font-bold text-lg">x{item.quantity}</td>
                <td className="py-6 text-right font-medium text-lg">{formatCurrency(item.unitPrice)}</td>
                <td className="py-6 text-right font-black text-2xl text-black">{formatCurrency(calculateSubtotal(item.quantity, item.unitPrice))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-20">
          <div className="w-1/2 space-y-6">
            <div className="flex justify-between border-b border-zinc-100 pb-3 px-6">
              <span className="text-zinc-400 font-black uppercase text-[10px] tracking-widest self-end">Subtotal Líquido</span>
              <span className="font-bold text-zinc-900 text-xl">{formatCurrency(rawTotal)}</span>
            </div>
            
            <div className="flex justify-between items-center py-8 px-10 bg-orange-600 rounded-[2.5rem] shadow-2xl shadow-orange-200">
              <div className="flex flex-col">
                <span className="font-black text-white text-lg uppercase tracking-tighter">TOTAL À VISTA</span>
                <span className="text-[10px] font-black text-orange-200 mt-1 uppercase tracking-widest italic">PIX / Dinheiro (Margem Inc.)</span>
              </div>
              <span className="text-5xl font-black text-white">{formatCurrency(totalWithMargin)}</span>
            </div>

            <div className="flex justify-between items-center py-6 px-10 border-4 border-zinc-100 rounded-[2.5rem]">
              <div className="flex flex-col">
                <span className="font-black text-zinc-400 text-sm uppercase tracking-tighter">Cartão de Crédito</span>
                <span className="text-[9px] font-bold text-zinc-300 mt-1 uppercase tracking-widest">Consulte parcelas</span>
              </div>
              <span className="text-3xl font-black text-zinc-900">{formatCurrency(totalWithCreditCard)}</span>
            </div>
          </div>
        </div>

        {client.notes && (
          <div className="bg-zinc-50 p-10 rounded-3xl border border-zinc-100 mb-20 page-break-inside-avoid">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Informações Importantes / Condições</h3>
            <p className="text-lg text-zinc-800 leading-relaxed whitespace-pre-wrap font-bold">{client.notes}</p>
          </div>
        )}

        <div className="mt-auto pt-24 flex justify-between items-end border-t-2 border-zinc-100">
            <div className="text-[10px] text-zinc-400 font-black max-w-sm uppercase leading-relaxed tracking-tight">
                KLSINFORMATICA - Este documento é uma estimativa de preços válida sob consulta de estoque e prazos de entrega.
            </div>
            <div className="text-center">
                <div className="w-72 border-b-4 border-black mb-4 mx-auto"></div>
                <p className="text-sm font-black uppercase tracking-widest text-black">KLSINFORMATICA</p>
                <p className="text-[9px] text-zinc-400 mt-2 font-bold uppercase tracking-tighter italic">Responsável Comercial</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
