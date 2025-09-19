import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticação e redirecionar
    if (typeof window !== 'undefined') {
      if (window.netlifyIdentity) {
        window.netlifyIdentity.on('init', (user: any) => {
          if (user) {
            router.push('/react/dashboard');
          } else {
            router.push('/login.html');
          }
        });
      } else {
        // Se não tiver netlify identity, redirecionar para login
        router.push('/login.html');
      }
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Portal da Qualidade - React</title>
        <meta name="description" content="Sistema de indicadores de qualidade - Versão React" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando versão React...</p>
        </div>
      </div>
    </>
  );
}
