import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, Search, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-success/10">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-lg">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">Achados e Perdidos</span>
          </button>
          <Button onClick={() => navigate('/auth')} variant="outline">
            Entrar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Reencontre o que Importa
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema completo de gestão de achados e perdidos. Registre, busque e recupere itens de forma rápida e organizada.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-lg px-8">
              Saber Mais
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-card border shadow-lg hover:shadow-xl transition-all">
            <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-warning" />
            </div>
            <h3 className="text-xl font-bold mb-3">Registre Facilmente</h3>
            <p className="text-muted-foreground">
              Cadastre itens perdidos ou encontrados com descrições detalhadas e fotos para facilitar a identificação.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border shadow-lg hover:shadow-xl transition-all">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Busca Inteligente</h3>
            <p className="text-muted-foreground">
              Sistema de correspondência automática que sugere possíveis matches entre itens perdidos e encontrados.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border shadow-lg hover:shadow-xl transition-all">
            <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-success" />
            </div>
            <h3 className="text-xl font-bold mb-3">Devolução Rápida</h3>
            <p className="text-muted-foreground">
              Facilite a comunicação e agilize o processo de devolução dos itens aos seus proprietários.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 Achados e Perdidos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
