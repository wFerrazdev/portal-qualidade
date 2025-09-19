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
        <div className="absolute inset-0 bg-[#08090d]">
          <div 
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: `
                url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><pattern id="wave1" x="0" y="0" width="400" height="200" patternUnits="userSpaceOnUse"><path d="M0,100 Q100,50 200,100 T400,100" stroke="rgba(0,51,102,0.3)" stroke-width="2" fill="none" opacity="0.6"/><path d="M0,120 Q100,70 200,120 T400,120" stroke="rgba(0,51,102,0.2)" stroke-width="1.5" fill="none" opacity="0.4"/></pattern><pattern id="wave2" x="0" y="0" width="300" height="150" patternUnits="userSpaceOnUse"><path d="M0,75 Q75,25 150,75 T300,75" stroke="rgba(0,80,160,0.4)" stroke-width="1.5" fill="none" opacity="0.5"/><path d="M0,90 Q75,40 150,90 T300,90" stroke="rgba(0,80,160,0.3)" stroke-width="1" fill="none" opacity="0.3"/></pattern></defs><rect width="1200" height="800" fill="url(%23wave1)"/><rect width="1200" height="800" fill="url(%23wave2)" opacity="0.7"/></svg>'),
                linear-gradient(135deg, #001a33 0%, #003366 25%, #004080 50%, #0052a3 75%, #0066cc 100%)
              `,
              backgroundSize: 'cover, cover',
              backgroundPosition: 'center, center',
              backgroundBlendMode: 'hard-light, normal'
            }}
          />
          
          {/* Efeitos de onda animados */}
          <div 
            className="absolute inset-0 animate-wave-glow"
            style={{
              background: `
                radial-gradient(ellipse at 20% 80%, rgba(0, 102, 204, 0.3) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(0, 51, 102, 0.25) 0%, transparent 60%),
                radial-gradient(ellipse at 40% 40%, rgba(0, 80, 160, 0.2) 0%, transparent 60%)
              `
            }}
          />
          
          <div 
            className="absolute inset-0 animate-wave-move opacity-90"
            style={{
              background: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M0,150 Q200,50 400,150 T800,150 T1200,150" stroke="rgba(0,102,204,0.8)" stroke-width="4" fill="none" filter="url(%23glow)"><animate attributeName="d" values="M0,150 Q200,50 400,150 T800,150 T1200,150;M0,150 Q200,100 400,150 T800,150 T1200,150;M0,150 Q200,50 400,150 T800,150 T1200,150" dur="4s" repeatCount="indefinite"/></path><path d="M0,250 Q300,150 600,250 T1200,250" stroke="rgba(0,80,160,0.7)" stroke-width="3" fill="none" filter="url(%23glow)"><animate attributeName="d" values="M0,250 Q300,150 600,250 T1200,250;M0,250 Q300,200 600,250 T1200,250;M0,250 Q300,150 600,250 T1200,250" dur="5s" repeatCount="indefinite"/></path><path d="M0,350 Q400,250 800,350 T1200,350" stroke="rgba(0,51,102,0.6)" stroke-width="3" fill="none" filter="url(%23glow)"><animate attributeName="d" values="M0,350 Q400,250 800,350 T1200,350;M0,350 Q400,300 800,350 T1200,350;M0,350 Q400,250 800,350 T1200,350" dur="6s" repeatCount="indefinite"/></path><path d="M0,450 Q200,350 400,450 T800,450 T1200,450" stroke="rgba(0,102,204,0.5)" stroke-width="2" fill="none" filter="url(%23glow)"><animate attributeName="d" values="M0,450 Q200,350 400,450 T800,450 T1200,450;M0,450 Q200,400 400,450 T800,450 T1200,450;M0,450 Q200,350 400,450 T800,450 T1200,450" dur="7s" repeatCount="indefinite"/></path></svg>')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
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
