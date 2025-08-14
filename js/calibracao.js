document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DE ELEMENTOS ---
    const addEquipmentBtn = document.getElementById('add-equipment-btn');
    const modal = document.getElementById('equipment-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const equipmentForm = document.getElementById('equipment-form');
    const tableBody = document.getElementById('equipment-table-body');
    const loadingSpinner = document.getElementById('loading-spinner');
    const modalTitle = document.getElementById('modal-title');
    const deleteBtn = document.getElementById('delete-btn');

    // --- LÓGICA DE CONTROLO DO MODAL ---

    // Função para abrir o modal (agora mais inteligente)
    const openModal = (equipamento = null) => {
        equipmentForm.reset(); // Sempre limpa o formulário
        
        if (equipamento) {
            // MODO DE EDIÇÃO
            modalTitle.textContent = 'Editar Equipamento';
            // Preenche todos os campos do formulário com os dados do equipamento
            document.getElementById('equipment-id').value = equipamento.codigo; // Guarda o ID original
            document.getElementById('codigo').value = equipamento.codigo;
            document.getElementById('equipamento').value = equipamento.equipamento;
            document.getElementById('fabricante_modelo').value = equipamento.fabricante_modelo;
            // ... (adicionar outros campos aqui se necessário)
            document.getElementById('status').value = equipamento.status;
            document.getElementById('situacao').value = equipamento.situacao;
            document.getElementById('setor').value = equipamento.setor;
            // Formata as datas para o formato YYYY-MM-DD que o input[type=date] espera
            if (equipamento.data_vencimento) {
                 document.getElementById('data_vencimento').value = new Date(equipamento.data_vencimento).toISOString().split('T')[0];
            }
            deleteBtn.classList.remove('hidden');
        } else {
            // MODO DE ADIÇÃO
            modalTitle.textContent = 'Adicionar Novo Equipamento';
            deleteBtn.classList.add('hidden');
        }
        modal.style.display = 'flex';
    };

    const closeModal = () => modal.style.display = 'none';

    addEquipmentBtn.addEventListener('click', () => openModal()); // Chama sem dados para Adicionar
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // --- LÓGICA DE BUSCA E RENDERIZAÇÃO DOS DADOS ---
    const fetchAndRenderEquipment = async () => {
        loadingSpinner.style.display = 'block';
        tableBody.innerHTML = '';

        try {
            const response = await fetch('/.netlify/functions/getEquipamentos');
            if (!response.ok) throw new Error('Falha ao buscar os dados.');
            const equipamentos = await response.json();

            if (equipamentos.length === 0) {
                tableBody.innerHTML = '<tr class="empty-row"><td colspan="8">Nenhum equipamento encontrado.</td></tr>';
            } else {
                equipamentos.forEach(equip => {
                    const tr = document.createElement('tr');
                    // Simplificando as colunas exibidas para um visual mais limpo
                    tr.innerHTML = `
                        <td><strong>${equip.codigo}</strong></td>
                        <td>${equip.equipamento}</td>
                        <td>${equip.setor || 'N/A'}</td>
                        <td><span class="status-badge status-${equip.status?.toLowerCase().replace(' ', '-')}">${equip.status || 'N/A'}</span></td>
                        <td>${equip.situacao || 'N/A'}</td>
                        <td>${equip.data_vencimento ? new Date(equip.data_vencimento).toLocaleDateString('pt-BR') : 'N/A'}</td>
                        <td><button class="edit-button-table" data-id="${equip.codigo}">Editar</button></td>
                    `;
                    tableBody.appendChild(tr);
                });
            }
        } catch (error) {
            console.error('Erro:', error);
            tableBody.innerHTML = `<tr class="empty-row"><td colspan="8">Erro ao carregar os dados. Tente novamente.</td></tr>`;
        } finally {
            loadingSpinner.style.display = 'none';
        }
    };

    // --- EVENT LISTENER PARA OS BOTÕES "EDITAR" ---
    tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('edit-button-table')) {
            const id = event.target.dataset.id;
            // Busca os dados completos do equipamento específico para preencher o modal
            try {
                const response = await fetch(`/.netlify/functions/getEquipamentos?codigo=${id}`);
                if (!response.ok) throw new Error('Equipamento não encontrado.');
                const equipamento = await response.json();
                openModal(equipamento); // Abre o modal com os dados
            } catch (error) {
                console.error('Erro ao buscar equipamento:', error);
                alert('Não foi possível carregar os dados para edição.');
            }
        }
    });

    fetchAndRenderEquipment();
});