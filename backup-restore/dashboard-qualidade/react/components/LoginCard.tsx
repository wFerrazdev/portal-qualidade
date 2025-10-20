import React from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

interface LoginCardProps {
  onLogin: () => void;
}

const LoginCard: React.FC<LoginCardProps> = ({ onLogin }) => {
  return (
    <motion.div
      className="relative bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Efeito de brilho sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-3xl" />
      
      <div className="text-center space-y-6 relative z-10">
        {/* Título */}
        <motion.h3
          className="text-2xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Acessar a Plataforma
        </motion.h3>
        
        {/* Descrição */}
        <motion.p
          className="text-gray-600 text-sm mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Insira suas credenciais para continuar.
        </motion.p>
        
        {/* Botão */}
        <motion.button
          onClick={onLogin}
          className="relative w-full flex justify-center items-center py-4 px-8 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
          <span className="relative z-10 flex items-center gap-3">
            <LogIn className="h-5 w-5" />
            Acessar
          </span>
        </motion.button>
      </div>

      {/* Footer */}
      <motion.div
        className="mt-8 pt-6 border-t border-gray-200 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p className="text-sm text-gray-500">
          &copy; 2025 - Developed by William Ferraz
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoginCard;