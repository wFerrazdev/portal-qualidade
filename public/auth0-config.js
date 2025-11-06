// Configuração do Auth0 para o Portal da Qualidade
const auth0Config = {
    domain: 'dev-oii2kkbrimlakra2.us.auth0.com', // Substitua pelo seu domínio Auth0
    clientId: '6ysBLYrbpaDM51XQ818fpA4ngJFogQZX', // Substitua pelo seu Client ID
    redirectUri: window.location.origin + '/callback.html'
    // audience removido - não é necessário para autenticação simples
};

// Cache para evitar muitas requisições
let userCache = null;
let lastCheckTime = 0;
let isChecking = false; // Flag para evitar múltiplas verificações simultâneas
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função para verificar se o usuário está autenticado
async function checkAuth() {
    try {
        const token = localStorage.getItem('auth0_token');
        if (!token) {
            return false;
        }
        
        // Evitar múltiplas verificações simultâneas
        if (isChecking) {
            // Aguardar a verificação atual terminar
            while (isChecking) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return userCache;
        }
        
        // Verificar cache primeiro
        const now = Date.now();
        if (userCache && (now - lastCheckTime) < CACHE_DURATION) {
            return userCache;
        }
        
        isChecking = true;
        
        // Verificar se o token ainda é válido (com rate limiting)
        const response = await fetch(`https://${auth0Config.domain}/userinfo`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            userCache = user;
            lastCheckTime = now;
            isChecking = false;
            return user;
        } else if (response.status === 429) {
            // Rate limit atingido - usar cache se disponível
            console.warn('Rate limit atingido, usando cache');
            isChecking = false;
            if (userCache) {
                return userCache;
            }
            // Se não há cache, retornar false para evitar loop
            localStorage.removeItem('auth0_token');
            userCache = null;
            return false;
        } else {
            localStorage.removeItem('auth0_token');
            userCache = null;
            isChecking = false;
            return false;
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        isChecking = false;
        // Em caso de erro, usar cache se disponível
        if (userCache) {
            console.warn('Usando cache devido a erro de conexão');
            return userCache;
        }
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
        scope: 'openid profile email'
        // audience removido - não é necessário para autenticação simples
    });
    
    window.location.href = `https://${auth0Config.domain}/authorize?${params}`;
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('auth0_token');
    userCache = null; // Limpar cache
    lastCheckTime = 0;
    isChecking = false; // Limpar flag de verificação
    const params = new URLSearchParams({
        returnTo: window.location.origin + '/login.html',
        client_id: auth0Config.clientId
    });
    
    window.location.href = `https://${auth0Config.domain}/v2/logout?${params}`;
}

// Função para limpar cache de autenticação
function clearAuthCache() {
    userCache = null;
    lastCheckTime = 0;
    isChecking = false;
}

// Função para decodificar JWT token (sem verificar assinatura)
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Erro ao decodificar token:', error);
        return null;
    }
}

// Função para obter roles do usuário atual
function getUserRoles() {
    const token = localStorage.getItem('auth0_token');
    if (!token) {
        return [];
    }
    
    const decoded = decodeJWT(token);
    if (!decoded) {
        return [];
    }
    
    // Namespace definido na Action do Auth0
    const ns = 'https://portalqualidade.com/';
    const roles = decoded[ns + 'roles'];
    
    return Array.isArray(roles) ? roles : [];
}

// Função para verificar se o usuário tem uma role específica
function hasRole(role) {
    const roles = getUserRoles();
    return roles.includes(role);
}

// Função para verificar se o usuário tem uma permissão específica (para uso futuro)
function hasPermission(permission) {
    const token = localStorage.getItem('auth0_token');
    if (!token) {
        return false;
    }
    
    const decoded = decodeJWT(token);
    if (!decoded) {
        return false;
    }
    
    const ns = 'https://portalqualidade.com/';
    const permissions = decoded[ns + 'permissions'];
    
    if (!Array.isArray(permissions)) {
        return false;
    }
    
    return permissions.includes(permission);
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
    // Evitar verificações múltiplas na mesma sessão
    if (window.authChecked) {
        return;
    }
    window.authChecked = true;
    
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
