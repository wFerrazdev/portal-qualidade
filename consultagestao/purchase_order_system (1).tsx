import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Package, CheckCircle, Clock, XCircle, Eye, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';

const App = () => {
  const STATUSES = {
    AGUARDANDO_APROVACAO_SC: { label: 'Aguardando Aprovação SC', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    SC_APROVADA: { label: 'SC Aprovada', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    AGUARDANDO_APROVACAO_OC: { label: 'Aguardando Aprovação OC', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    OC_APROVADA: { label: 'OC Aprovada', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    PEDIDO_EMITIDO: { label: 'Pedido Emitido', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    AGUARDANDO_PAGAMENTO: { label: 'Aguardando Pagamento', color: 'bg-pink-50 text-pink-700 border-pink-200' },
    PAGO: { label: 'Pago', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    AGUARDANDO_ENTREGA: { label: 'Aguardando Entrega', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    ENTREGUE: { label: 'Entregue', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELADO: { label: 'Cancelado', color: 'bg-red-50 text-red-700 border-red-200' }
  };

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({
    descricao: '',
    fornecedor: '',
    valor: '',
    observacoes: ''
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const loadOrders = async () => {
    try {
      const result = await window.storage.list('order:');
      if (result && result.keys) {
        const loadedOrders = await Promise.all(
          result.keys.map(async (key) => {
            const data = await window.storage.get(key);
            return data ? JSON.parse(data.value) : null;
          })
        );
        setOrders(loadedOrders.filter(o => o !== null).sort((a, b) => b.numero - a.numero));
      }
    } catch (error) {
      console.log('Nenhum pedido encontrado');
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.numero.toString().includes(searchTerm) ||
        order.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'TODOS') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const generateOrderNumber = () => {
    return orders.length > 0 ? Math.max(...orders.map(o => o.numero)) + 1 : 1001;
  };

  const handleCreateOrder = async () => {
    if (!newOrder.descricao || !newOrder.fornecedor || !newOrder.valor) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    const order = {
      numero: generateOrderNumber(),
      descricao: newOrder.descricao,
      fornecedor: newOrder.fornecedor,
      valor: parseFloat(newOrder.valor),
      observacoes: newOrder.observacoes,
      status: 'AGUARDANDO_APROVACAO_SC',
      dataCriacao: new Date().toISOString(),
      historico: [{
        data: new Date().toISOString(),
        status: 'AGUARDANDO_APROVACAO_SC',
        observacao: 'Solicitação de compra criada pelo setor de Qualidade'
      }]
    };

    try {
      await window.storage.set(`order:${order.numero}`, JSON.stringify(order));
      setOrders([order, ...orders]);
      setShowModal(false);
      setNewOrder({ descricao: '', fornecedor: '', valor: '', observacoes: '' });
    } catch (error) {
      alert('Erro ao criar pedido');
    }
  };

  const updateOrderStatus = async (order, newStatus, observacao = '') => {
    const updatedOrder = {
      ...order,
      status: newStatus,
      historico: [
        ...order.historico,
        {
          data: new Date().toISOString(),
          status: newStatus,
          observacao: observacao || `Status alterado para ${STATUSES[newStatus].label}`
        }
      ]
    };

    try {
      await window.storage.set(`order:${order.numero}`, JSON.stringify(updatedOrder));
      setOrders(orders.map(o => o.numero === order.numero ? updatedOrder : o));
      if (selectedOrder && selectedOrder.numero === order.numero) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'AGUARDANDO_APROVACAO_SC': 'SC_APROVADA',
      'SC_APROVADA': 'AGUARDANDO_APROVACAO_OC',
      'AGUARDANDO_APROVACAO_OC': 'OC_APROVADA',
      'OC_APROVADA': 'PEDIDO_EMITIDO',
      'PEDIDO_EMITIDO': 'AGUARDANDO_PAGAMENTO',
      'AGUARDANDO_PAGAMENTO': 'PAGO',
      'PAGO': 'AGUARDANDO_ENTREGA',
      'AGUARDANDO_ENTREGA': 'ENTREGUE'
    };
    return statusFlow[currentStatus];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusCounts = () => {
    const counts = {};
    Object.keys(STATUSES).forEach(status => {
      counts[status] = orders.filter(o => o.status === status).length;
    });
    counts.TODOS = orders.length;
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 overflow-auto">
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Pedidos de Compra
            </h1>
            <p className="text-sm text-gray-600 mt-2">Gerencie solicitações e acompanhe o fluxo completo</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 font-medium"
          >
            <Plus size={20} />
            Nova Solicitação
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total de Pedidos</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                  {orders.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Package className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Aguardando</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {statusCounts.AGUARDANDO_APROVACAO_SC + statusCounts.AGUARDANDO_APROVACAO_OC}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Clock className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Em Andamento</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {statusCounts.SC_APROVADA + statusCounts.OC_APROVADA + statusCounts.PEDIDO_EMITIDO + statusCounts.AGUARDANDO_PAGAMENTO + statusCounts.PAGO + statusCounts.AGUARDANDO_ENTREGA}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <TrendingUp className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Concluídos</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{statusCounts.ENTREGUE}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="text-white" size={28} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3 text-white/70" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por número, descrição ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/30"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-3 text-white/70" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-12 pr-10 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/30 appearance-none"
                >
                  <option value="TODOS" className="bg-gray-800">Todos os Status</option>
                  {Object.keys(STATUSES).map(status => (
                    <option key={status} value={status} className="bg-gray-800">
                      {STATUSES[status].label} ({statusCounts[status]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Número</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fornecedor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order, idx) => (
                  <tr key={order.numero} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {idx + 1}
                        </div>
                        <span className="font-bold text-gray-900">#{order.numero}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium max-w-xs truncate">{order.descricao}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{order.fornecedor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {formatCurrency(order.valor)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${STATUSES[order.status].color}`}>
                        {STATUSES[order.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(order.dataCriacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-indigo-600 flex items-center gap-1.5 text-sm font-semibold group"
                      >
                        <Eye size={18} />
                        <span>Ver</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={40} className="text-blue-600 opacity-50" />
                </div>
                <p className="text-gray-500 font-medium">Nenhum pedido encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Nova Solicitação de Compra
              </h2>
              <p className="text-sm text-gray-600 mt-1">Preencha os dados para criar uma nova solicitação</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição do Item/Serviço *
                </label>
                <input
                  type="text"
                  value={newOrder.descricao}
                  onChange={(e) => setNewOrder({...newOrder, descricao: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ex: Material de laboratório, equipamento, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fornecedor *
                </label>
                <input
                  type="text"
                  value={newOrder.fornecedor}
                  onChange={(e) => setNewOrder({...newOrder, fornecedor: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor Estimado (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newOrder.valor}
                  onChange={(e) => setNewOrder({...newOrder, valor: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={newOrder.observacoes}
                  onChange={(e) => setNewOrder({...newOrder, observacoes: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  rows="3"
                  placeholder="Informações adicionais..."
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleCreateOrder}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg shadow-blue-500/30"
              >
                Criar Solicitação
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewOrder({ descricao: '', fornecedor: '', valor: '', observacoes: '' });
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-8 my-8 shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Pedido #{selectedOrder.numero}
                </h2>
                <span className={`inline-block mt-3 px-4 py-2 rounded-xl text-sm font-semibold border-2 ${STATUSES[selectedOrder.status].color}`}>
                  {STATUSES[selectedOrder.status].label}
                </span>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={28} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
                <h3 className="font-bold text-gray-900 mb-4 text-base flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  Informações do Pedido
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600 block mb-1 font-medium">Descrição:</span>
                    <p className="font-semibold text-gray-900">{selectedOrder.descricao}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1 font-medium">Fornecedor:</span>
                    <p className="font-semibold text-gray-900">{selectedOrder.fornecedor}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1 font-medium">Valor:</span>
                    <p className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {formatCurrency(selectedOrder.valor)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1 font-medium">Data de Criação:</span>
                    <p className="font-semibold text-gray-900">{formatDate(selectedOrder.dataCriacao)}</p>
                  </div>
                  {selectedOrder.observacoes && (
                    <div>
                      <span className="text-gray-600 block mb-1 font-medium">Observações:</span>
                      <p className="font-semibold text-gray-900">{selectedOrder.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-base">Ações Rápidas</h3>
                <div className="space-y-3">
                  {selectedOrder.status !== 'ENTREGUE' && selectedOrder.status !== 'CANCELADO' && getNextStatus(selectedOrder.status) && (
                    <button
                      onClick={() => {
                        const nextStatus = getNextStatus(selectedOrder.status);
                        updateOrderStatus(selectedOrder, nextStatus);
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg shadow-emerald-500/30"
                    >
                      <CheckCircle size={20} />
                      Avançar: {STATUSES[getNextStatus(selectedOrder.status)].label}
                    </button>
                  )}
                  {selectedOrder.status !== 'CANCELADO' && selectedOrder.status !== 'ENTREGUE' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder, 'CANCELADO', 'Pedido cancelado')}
                      className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-3 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg shadow-red-500/30"
                    >
                      <XCircle size={20} />
                      Cancelar Pedido
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-5 text-base">Histórico do Pedido</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {selectedOrder.historico.slice().reverse().map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex-shrink-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 ${STATUSES[item.status].color} shadow-sm`}>
                        <CheckCircle size={20} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 text-sm">{STATUSES[item.status].label}</p>
                          <p className="text-xs text-gray-600 mt-1">{item.observacao}</p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(item.data)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-2.5 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;