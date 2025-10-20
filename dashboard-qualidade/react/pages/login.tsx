import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useUser } from '@auth0/nextjs-auth0/client';
import AnimatedWaves from '../components/AnimatedWaves';
import FloatingParticles from '../components/FloatingParticles';
import LoginCard from '../components/LoginCard';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Head>
        <title>Login | Portal da Qualidade - React</title>
        <meta name="description" content="Faça login no Portal da Qualidade - Versão React" />
      </Head>

      {/* Background principal */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800" />
      
      {/* Grid pattern de fundo */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Ondas animadas */}
      <AnimatedWaves />
      
      {/* Partículas flutuantes */}
      <FloatingParticles />
      
      {/* Efeito de brilho central */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Conteúdo principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo e título */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              className="mx-auto h-24 w-auto"
              src="/GT Branco - Transparente.png"
              alt="GT Logo"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Portal da Qualidade
            </h2>
            <p className="text-blue-200 text-sm mt-2">
              Acesse o sistema de indicadores - Versão React
            </p>
          </motion.div>

          {/* Card de Login */}
          <LoginCard onLogin={handleLogin} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;