import React from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useAnimations } from '../hooks/useAnimations';

interface LoginCardProps {
  onLogin: () => void;
}

const LoginCard: React.FC<LoginCardProps> = ({ onLogin }) => {
  const { fadeInUp, scaleIn } = useAnimations();

  return (
    <motion.div
      className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 overflow-hidden"
      {...fadeInUp}
      whileHover={{ scale: 1.02 }}
    >
      {/* Efeito de brilho no card */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10 rounded-3xl" />
      
      {/* Borda animada */}
      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: 'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
          padding: '1px'
        }}
        animate={{
          background: [
            'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
            'linear-gradient(225deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
            'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.3), transparent)'
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="text-center space-y-6">
        <motion.h3
          className="text-xl font-semibold text-white mb-4"
          {...scaleIn}
          transition={{ delay: 0.2 }}
        >
          Acessar a Plataforma
        </motion.h3>
        
        <motion.p
          className="text-blue-200 text-sm mb-6"
          {...scaleIn}
          transition={{ delay: 0.3 }}
        >
          Insira suas credenciais para continuar.
        </motion.p>
        
        <motion.button
          onClick={onLogin}
          className="relative w-full flex justify-center items-center py-4 px-8 rounded-xl text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          {...scaleIn}
          transition={{ delay: 0.4 }}
        >
          {/* Efeito de brilho no botão */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
          <span className="relative z-10 flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Acessar
          </span>
        </motion.button>
      </div>

      {/* Footer do Card de Login */}
      <motion.div
        className="mt-8 pt-6 border-t border-blue-700 border-opacity-20 text-center"
        {...scaleIn}
        transition={{ delay: 0.5 }}
      >
        <p className="text-blue-200 text-sm opacity-80">
          &copy; 2025 - Developed by William Ferraz
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoginCard;
