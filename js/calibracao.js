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
    const openModal = (equipamento = null) => {
        equipmentForm.reset();
        
        if (equipamento) { // MODO DE EDIÇÃO
            modalTitle.textContent = 'Editar Equipamento';
            document.getElementById('equipment-id').value = equipamento.codigo;
            document.getElementById('codigo').value = equipamento.codigo;
            document.getElementById('codigo').readOnly = true; // Não permite editar o código
            document.getElementById('equipamento').value = equipamento.equipamento;
            document.getElementById('fabricante_modelo').value = equipamento.fabricante_modelo;
            document.getElementById('anos_validade').value = equipamento.anos_validade;
            document.getElementById('status').value = equipamento.status;
            document.getElementById('situacao').value = equipamento.situacao;
            document.getElementById('setor').value = equipamento.setor;
            document.getElementById('responsavel').value = equipamento.responsavel;
            document.getElementById('observacao').value = equipamento.observacao;
            
            if (equipamento.data_calibracao) document.getElementById('data_calibracao').value = new Date(equipamento.data_calibracao).toISOString().split('T')[0];
            if (equipamento.data_vencimento) document.getElementById('data_vencimento').value = new Date(equipamento.data_vencimento).toISOString().split('T')[0];
            if (equipamento.data_situacao) document.getElementById('data_situacao').value = new Date(equipamento.data_situacao).toISOString().split('T')[0];
            
            deleteBtn.classList.remove('hidden');
        } else { // MODO DE ADIÇÃO
            modalTitle.textContent = 'Adicionar Novo Equipamento';
            document.getElementById('codigo').readOnly = false;
            deleteBtn.classList.add('hidden');
        }
        modal.style.display = 'flex';
    };
    const closeModal = () => modal.style.display = 'none';
    addEquipmentBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // --- LÓGICA DE BUSCA E RENDERIZAÇÃO DOS DADOS ---
    const fetchAndRenderEquipment = async () => {
        // ... (esta função permanece a mesma da versão anterior, não precisa de ser alterada)
    };

    // --- EVENT LISTENER PARA OS BOTÕES "EDITAR" ---
    tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('edit-button-table')) {
            const id = event.target.dataset.id;
            try {
                const response = await fetch(`/.netlify/functions/getEquipamento?codigo=${id}`);
                if (!response.ok) throw new Error('Equipamento não encontrado.');
                const equipamento = await response.json(); // CORRIGIDO: Não é mais um array
                openModal(equipamento);
            } catch (error) {
                console.error('Erro ao buscar equipamento:', error);
                alert('Não foi possível carregar os dados para edição.');
            }
        }
    });

    // --- LÓGICA PARA SALVAR (ADICIONAR/EDITAR) ---
    equipmentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const originalId = document.getElementById('equipment-id').value;
        
        const equipamentoData = {
            codigo: document.getElementById('codigo').value,
            equipamento: document.getElementById('equipamento').value,
            fabricante_modelo: document.getElementById('fabricante_modelo').value,
            data_calibracao: document.getElementById('data_calibracao').value || null,
            anos_validade: document.getElementById('anos_validade').value || null,
            data_vencimento: document.getElementById('data_vencimento').value || null,
            status: document.getElementById('status').value,
            situacao: document.getElementById('situacao').value,
            data_situacao: document.getElementById('data_situacao').value || null,
            setor: document.getElementById('setor').value,
            responsavel: document.getElementById('responsavel').value,
            observacao: document.getElementById('observacao').value
        };

        try {
            let response;
            if (originalId) {
                // Se originalId existe, é uma ATUALIZAÇÃO (UPDATE)
                response = await fetch(`/.netlify/functions/updateEquipamento?codigo=${originalId}`, {
                    method: 'PUT',
                    body: JSON.stringify(equipamentoData)
                });
            } else {
                // Se não, é uma CRIAÇÃO (ADD)
                response = await fetch('/.netlify/functions/addEquipamento', {
                    method: 'POST',
                    body: JSON.stringify(equipamentoData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao salvar equipamento.');
            }
            
            closeModal();
            fetchAndRenderEquipment(); // Atualiza a tabela com os novos dados
            
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert(`Erro ao salvar: ${error.message}`);
        }
    });
    
    fetchAndRenderEquipment();
});