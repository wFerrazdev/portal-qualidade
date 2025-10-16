// Configuração do Auth0 para o Portal da Qualidade
const auth0Config = {
    domain: 'dev-oii2kkbrimlakra2.us.auth0.com', // Substitua pelo seu domínio Auth0
    clientId: '6ysBLYrbpaDM51XQ818fpA4ngJFogQZX', // Substitua pelo seu Client ID
    redirectUri: window.location.origin + '/callback.html',
    audience: 'https://portalqualidadewill.vercel.app/api'
};

// Função para verificar se o usuário está autenticado
async function checkAuth() {
    try {
        const token = localStorage.getItem('auth0_token');
        if (!token) {
            return false;
        }
        
        // Verificar se o token ainda é válido
        const response = await fetch(`https://${auth0Config.domain}/userinfo`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            return user;
        } else {
            localStorage.removeItem('auth0_token');
            return false;
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('auth0_token');
        return false;
    }
}

// Função para fazer login
function login() {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: auth0Config.clientId,
        redirect_uri: auth0Config.redirectUri,
        scope: 'openid profile email',
        audience: auth0Config.audience
    });
    
    window.location.href = `https://${auth0Config.domain}/authorize?${params}`;
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('auth0_token');
    const params = new URLSearchParams({
        returnTo: window.location.origin + '/login.html',
        client_id: auth0Config.clientId
    });
    
    window.location.href = `https://${auth0Config.domain}/v2/logout?${params}`;
}

// Função para obter token de acesso
async function getAccessToken() {
    return localStorage.getItem('auth0_token');
}

// Função para fazer requisições autenticadas
async function authenticatedFetch(url, options = {}) {
    const token = await getAccessToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(url, {
        ...options,
        headers
    });
}

// Inicializar verificação de autenticação quando a página carregar
document.addEventListener('DOMContentLoaded', async function() {
    const user = await checkAuth();
    
    if (!user) {
        // Se não estiver autenticado, redirecionar para login
        if (!window.location.pathname.includes('login.html') && 
            !window.location.pathname.includes('callback.html')) {
            window.location.href = '/login.html';
        }
    } else {
        // Se estiver autenticado, mostrar o conteúdo
        document.body.classList.remove('unauthenticated');
        
        // Adicionar informações do usuário se necessário
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.textContent = user.name || user.email;
        }
    }
});
