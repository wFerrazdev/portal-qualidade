import { useEffect, useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, User, Lock } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Verificar se já está logado
    if (typeof window !== 'undefined' && window.netlifyIdentity) {
      window.netlifyIdentity.on('init', (user: any) => {
        if (user) {
          window.location.href = '/react/dashboard';
        }
      });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (typeof window !== 'undefined' && window.netlifyIdentity) {
        // Usar Netlify Identity para login
        await window.netlifyIdentity.open();
      }
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login | Portal da Qualidade - React</title>
        <meta name="description" content="Faça login no Portal da Qualidade - Versão React" />
      </Head>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Background animado */}
        <div className="absolute inset-0 bg-[#08090d] overflow-hidden">
          {/* Gradiente de fundo */}
          <div 
            className="absolute inset-0 opacity-90"
            style={{
              background: 'linear-gradient(135deg, #001a33 0%, #003366 25%, #004080 50%, #0052a3 75%, #0066cc 100%)'
            }}
          />
          
          {/* Ondas animadas - Primeira camada (dentro da tela) */}
          <div 
            className="absolute inset-4 animate-wave-glow rounded-3xl"
            style={{
              background: `
                radial-gradient(ellipse at 30% 70%, rgba(0, 102, 204, 0.3) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 30%, rgba(0, 51, 102, 0.25) 0%, transparent 60%),
                radial-gradient(ellipse at 50% 50%, rgba(0, 80, 160, 0.2) 0%, transparent 60%)
              `
            }}
          />
          
          {/* Ondas animadas - Segunda camada (dentro da tela) */}
          <div 
            className="absolute inset-8 animate-wave-move opacity-60 rounded-2xl"
            style={{
              background: `
                linear-gradient(45deg, transparent 40%, rgba(0, 102, 204, 0.15) 50%, transparent 60%),
                linear-gradient(-45deg, transparent 40%, rgba(0, 80, 160, 0.15) 50%, transparent 60%)
              `
            }}
          />
          
          {/* Ondas animadas - Terceira camada (dentro da tela) */}
          <div 
            className="absolute inset-12 animate-wave-glow opacity-40 rounded-xl"
            style={{
              background: `
                conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(0, 102, 204, 0.1) 45deg, transparent 90deg),
                conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(0, 80, 160, 0.1) 45deg, transparent 90deg)
              `
            }}
          />
        </div>

        {/* Conteúdo principal */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Logo e título */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mx-auto h-20 w-20 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <img 
                  src="/GT Branco - Transparente.png" 
                  alt="GT Logo" 
                  className="h-12 w-12 object-contain"
                />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Portal da Qualidade
              </h2>
              <p className="text-blue-200 text-sm">
                Acesse o sistema de indicadores - Versão React
              </p>
            </motion.div>

            {/* Formulário de login */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-blue-300" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full pl-10 pr-3 py-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-blue-300" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="w-full pl-10 pr-12 py-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-blue-300 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <LogIn className="h-5 w-5 mr-2" />
                      Entrar (React)
                    </div>
                  )}
                </motion.button>
              </form>

              {/* Rodapé do card */}
              <div className="mt-8 pt-6 border-t border-white/20 text-center">
                <p className="text-blue-200 text-sm">
                  © 2025 - Developed by William Ferraz
                </p>
                <p className="text-blue-300 text-xs mt-1">
                  Versão React - Deploy Gradual
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
