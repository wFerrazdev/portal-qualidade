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

    // Função para abrir o modal
    const openModal = () => {
        modal.style.display = 'flex';
        modalTitle.textContent = 'Adicionar Novo Equipamento';
        equipmentForm.reset(); // Limpa o formulário
        deleteBtn.classList.add('hidden'); // Esconde o botão de excluir
    };

    // Função para fechar o modal
    const closeModal = () => {
        modal.style.display = 'none';
    };

    // Event Listeners para os botões do modal
    if (addEquipmentBtn) {
        addEquipmentBtn.addEventListener('click', openModal);
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    // Fecha o modal se o usuário clicar fora da área do conteúdo
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    // --- LÓGICA DE BUSCA E RENDERIZAÇÃO DOS DADOS ---

    // Função principal para buscar e exibir os equipamentos
    const fetchAndRenderEquipment = async () => {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (tableBody) tableBody.innerHTML = ''; // Limpa a tabela antes de preencher

        try {
            // Faz a chamada para a nossa função de backend (que ainda vamos criar)
            const response = await fetch('/.netlify/functions/getEquipamentos');
            
            if (!response.ok) {
                throw new Error('Falha ao buscar os dados dos equipamentos.');
            }

            const equipamentos = await response.json();

            if (equipamentos.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Nenhum equipamento encontrado.</td></tr>';
            } else {
                equipamentos.forEach(equip => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${equip.codigo}</td>
                        <td>${equip.equipamento}</td>
                        <td>${equip.fabricante_modelo || ''}</td>
                        <td>${equip.setor || ''}</td>
                        <td><span class="status-badge status-${equip.status?.toLowerCase()}">${equip.status || ''}</span></td>
                        <td>${equip.situacao || ''}</td>
                        <td>${equip.data_vencimento ? new Date(equip.data_vencimento).toLocaleDateString('pt-BR') : ''}</td>
                        <td>
                            <button class="edit-button-table" data-id="${equip.codigo}">Editar</button>
                        </td>
                    `;
                    tableBody.appendChild(tr);
                });
            }

        } catch (error) {
            console.error('Erro:', error);
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Erro ao carregar os dados. Tente novamente.</td></tr>`;
            }
        } finally {
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    };

    // --- EXECUÇÃO INICIAL ---
    // Chama a função para carregar os dados assim que a página é carregada
    fetchAndRenderEquipment();
});