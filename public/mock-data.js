// Dados mock para o Portal da Qualidade
// Substitui as APIs do Netlify temporariamente

const MOCK_DATA = {
    // Dados do Google Sheets (indicadores)
    sheetData: {
        'opt_por_cliente': [
            ['Cliente', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
            ['Cliente A', '95%', '97%', '96%', '98%'],
            ['Cliente B', '92%', '94%', '95%', '97%'],
            ['Cliente C', '89%', '91%', '93%', '95%']
        ],
        'opt_por_projeto': [
            ['Projeto', 'Status', 'Progresso', 'Qualidade'],
            ['Projeto Alpha', 'Em Andamento', '75%', 'A'],
            ['Projeto Beta', 'Concluído', '100%', 'A+'],
            ['Projeto Gamma', 'Planejamento', '25%', 'B']
        ],
        'nci_por_setor': [
            ['Setor', 'NCI Q1', 'NCI Q2', 'NCI Q3', 'NCI Q4'],
            ['Produção', '2', '1', '0', '1'],
            ['Qualidade', '1', '0', '1', '0'],
            ['Logística', '3', '2', '1', '2']
        ]
    },

    // Dados de projetos
    projetos: [
        {
            id: 1,
            nome: 'Projeto Alpha',
            descricao: 'Desenvolvimento de novo produto',
            status: 'Em Andamento',
            progresso: 75,
            data_inicio: '2024-01-15',
            data_fim: '2024-06-30',
            responsavel: 'João Silva',
            imagem_url: 'https://via.placeholder.com/300x200?text=Projeto+Alpha'
        },
        {
            id: 2,
            nome: 'Projeto Beta',
            descricao: 'Melhoria de processos',
            status: 'Concluído',
            progresso: 100,
            data_inicio: '2023-10-01',
            data_fim: '2024-02-28',
            responsavel: 'Maria Santos',
            imagem_url: 'https://via.placeholder.com/300x200?text=Projeto+Beta'
        },
        {
            id: 3,
            nome: 'Projeto Gamma',
            descricao: 'Implementação de sistema',
            status: 'Planejamento',
            progresso: 25,
            data_inicio: '2024-03-01',
            data_fim: '2024-12-31',
            responsavel: 'Pedro Costa',
            imagem_url: 'https://via.placeholder.com/300x200?text=Projeto+Gamma'
        }
    ],

    // Dados de auditorias
    auditorias: [
        {
            id: 1,
            tipo: 'Auditoria Interna',
            data: '2024-10-15',
            auditor: 'Ana Lima',
            setor: 'Produção',
            status: 'Concluída',
            resultado: 'Aprovado',
            observacoes: 'Todos os requisitos atendidos'
        },
        {
            id: 2,
            tipo: 'Auditoria Externa',
            data: '2024-10-10',
            auditor: 'Carlos Oliveira',
            setor: 'Qualidade',
            status: 'Em Andamento',
            resultado: 'Pendente',
            observacoes: 'Aguardando documentação'
        }
    ],

    // Dados de reuniões
    reunioes: [
        {
            id: 1,
            titulo: 'Reunião de Qualidade',
            data: '2024-10-20',
            hora: '14:00',
            participantes: 'João, Maria, Pedro',
            status: 'Agendada',
            descricao: 'Revisão dos indicadores de qualidade'
        },
        {
            id: 2,
            titulo: 'Reunião de Projetos',
            data: '2024-10-18',
            hora: '10:00',
            participantes: 'Ana, Carlos, João',
            status: 'Realizada',
            descricao: 'Acompanhamento do progresso dos projetos'
        }
    ]
};

// Função para simular delay de API
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Funções mock que substituem as APIs do Netlify
window.mockAPI = {
    // Simular getSheetData
    async getSheetData(params) {
        await delay(500); // Simular delay de rede
        
        const { id, sheets } = params;
        const sheetNames = sheets.split(',');
        const result = {};
        
        sheetNames.forEach(sheet => {
            if (MOCK_DATA.sheetData[sheet]) {
                result[sheet] = MOCK_DATA.sheetData[sheet];
            }
        });
        
        return { ok: true, json: () => Promise.resolve(result) };
    },

    // Simular getProjetos
    async getProjetos() {
        await delay(300);
        return { ok: true, json: () => Promise.resolve(MOCK_DATA.projetos) };
    },

    // Simular getAuditorias
    async getAuditorias() {
        await delay(300);
        return { ok: true, json: () => Promise.resolve(MOCK_DATA.auditorias) };
    },

    // Simular getReunioes
    async getReunioes() {
        await delay(300);
        return { ok: true, json: () => Promise.resolve(MOCK_DATA.reunioes) };
    },

    // Simular getUmItem
    async getUmItem(params) {
        await delay(200);
        const { type, id } = params;
        let item = null;
        
        switch(type) {
            case 'projetos':
                item = MOCK_DATA.projetos.find(p => p.id == id);
                break;
            case 'auditorias':
                item = MOCK_DATA.auditorias.find(a => a.id == id);
                break;
            case 'reunioes':
                item = MOCK_DATA.reunioes.find(r => r.id == id);
                break;
        }
        
        return { ok: true, json: () => Promise.resolve(item) };
    },

    // Simular addProjeto
    async addProjeto(data) {
        await delay(400);
        const newId = Math.max(...MOCK_DATA.projetos.map(p => p.id)) + 1;
        const newProject = { ...JSON.parse(data), id: newId };
        MOCK_DATA.projetos.push(newProject);
        return { ok: true, json: () => Promise.resolve(newProject) };
    },

    // Simular updateProjeto
    async updateProjeto(params, data) {
        await delay(400);
        const { id } = params;
        const index = MOCK_DATA.projetos.findIndex(p => p.id == id);
        if (index !== -1) {
            MOCK_DATA.projetos[index] = { ...JSON.parse(data), id };
        }
        return { ok: true, json: () => Promise.resolve({ success: true }) };
    },

    // Simular deleteProjeto
    async deleteProjeto(params) {
        await delay(300);
        const { id } = params;
        MOCK_DATA.projetos = MOCK_DATA.projetos.filter(p => p.id != id);
        return { ok: true, json: () => Promise.resolve({ success: true }) };
    },

    // Simular setSheetParam
    async setSheetParam(data) {
        await delay(200);
        return { ok: true, json: () => Promise.resolve({ success: true }) };
    }
};
