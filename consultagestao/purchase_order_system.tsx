import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, DollarSign, Package, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

const STATUSES = {
  AGUARDANDO_APROVACAO_SC: { label: 'Aguardando Aprovação SC', color: 'bg-yellow-100 text-yellow-800', step: 1 },
  SC_APROVADA: { label: 'SC Aprovada', color: 'bg-blue-100 text-blue-800', step: 2 },
  AGUARDANDO_APROVACAO_OC: { label: 'Aguardando Aprovação OC', color: 'bg-orange-100 text-orange-800', step: 3 },
  OC_APROVADA: { label: 'OC Aprovada', color: 'bg-purple-100 text-purple-800', step: 4 },
  PEDIDO_EMITIDO: { label: 'Pedido Emitido', color: 'bg-indigo-100 text-indigo-800', step: 5 },
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando Pagamento', color: 'bg-pink-100 text-pink-800', step: 6 },
  PAGO: { label: 'Pago', color: 'bg-cyan-100 text-cyan-800', step: 7 },
  AGUARDANDO_ENTREGA: { label: 'Aguardando Entrega', color: 'bg-teal-100 text-teal-800', step: 7 },
  ENTREGUE: { label: 'Entregue', color: 'bg-green-100 text-green-800', step: 8 },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800', step: 0 }
};

const App = () => {
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sistema de Pedidos de Compra</h1>
              <p className="text-gray-600 mt-1">Controle completo do fluxo de solicitações</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              Nova Solicitação
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <Package className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aguardando Aprovação</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statusCounts.AGUARDANDO_APROVACAO_SC + statusCounts.AGUARDANDO_APROVACAO_OC}
                </p>
              </div>
              <Clock className="text-yellow-600" size={32} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statusCounts.SC_APROVADA + statusCounts.OC_APROVADA + statusCounts.PEDIDO_EMITIDO + statusCounts.AGUARDANDO_PAGAMENTO + statusCounts.PAGO + statusCounts.AGUARDANDO_ENTREGA}
                </p>
              </div>
              <DollarSign className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entregues</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.ENTREGUE}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por número, descrição ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="TODOS">Todos os Status</option>
                  {Object.keys(STATUSES).map(status => (
                    <option key={status} value={status}>
                      {STATUSES[status].label} ({statusCounts[status]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map(order => (
                  <tr key={order.numero} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">#{order.numero}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.descricao}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.fornecedor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(order.valor)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUSES[order.status].color}`}>
                        {STATUSES[order.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.dataCriacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Eye size={16} />
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhum pedido encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Nova Solicitação de Compra</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição do Item/Serviço *
                </label>
                <input
                  type="text"
                  value={newOrder.descricao}
                  onChange={(e) => setNewOrder({...newOrder, descricao: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Material de laboratório, equipamento, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor *
                </label>
                <input
                  type="text"
                  value={newOrder.fornecedor}
                  onChange={(e) => setNewOrder({...newOrder, fornecedor: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Estimado (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newOrder.valor}
                  onChange={(e) => setNewOrder({...newOrder, valor: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={newOrder.observacoes}
                  onChange={(e) => setNewOrder({...newOrder, observacoes: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Informações adicionais..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateOrder}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Criar Solicitação
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewOrder({ descricao: '', fornecedor: '', valor: '', observacoes: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">Pedido #{selectedOrder.numero}</h2>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${STATUSES[selectedOrder.status].color}`}>
                  {STATUSES[selectedOrder.status].label}
                </span>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Informações do Pedido</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Descrição:</span>
                    <p className="font-medium">{selectedOrder.descricao}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Fornecedor:</span>
                    <p className="font-medium">{selectedOrder.fornecedor}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Valor:</span>
                    <p className="font-medium text-lg">{formatCurrency(selectedOrder.valor)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Data de Criação:</span>
                    <p className="font-medium">{formatDate(selectedOrder.dataCriacao)}</p>
                  </div>
                  {selectedOrder.observacoes && (
                    <div>
                      <span className="text-gray-600">Observações:</span>
                      <p className="font-medium">{selectedOrder.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Ações Rápidas</h3>
                <div className="space-y-2">
                  {selectedOrder.status !== 'ENTREGUE' && selectedOrder.status !== 'CANCELADO' && getNextStatus(selectedOrder.status) && (
                    <button
                      onClick={() => {
                        const nextStatus = getNextStatus(selectedOrder.status);
                        updateOrderStatus(selectedOrder, nextStatus);
                      }}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Avançar para: {STATUSES[getNextStatus(selectedOrder.status)].label}
                    </button>
                  )}
                  {selectedOrder.status !== 'CANCELADO' && selectedOrder.status !== 'ENTREGUE' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder, 'CANCELADO', 'Pedido cancelado')}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Cancelar Pedido
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Histórico do Pedido</h3>
              <div className="space-y-3">
                {selectedOrder.historico.slice().reverse().map((item, index) => (
                  <div key={index} className="flex gap-3 pb-3 border-b last:border-b-0">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${STATUSES[item.status].color}`}>
                        <CheckCircle size={20} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{STATUSES[item.status].label}</p>
                          <p className="text-sm text-gray-600">{item.observacao}</p>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(item.data)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
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