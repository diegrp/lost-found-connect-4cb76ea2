import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Search, CheckCircle, AlertCircle, Plus, Link as LinkIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    matched: 0,
    returned: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const { data: items, error } = await supabase
        .from('items')
        .select('status, is_lost');

      if (error) throw error;

      const lost = items?.filter(item => item.is_lost).length || 0;
      const found = items?.filter(item => !item.is_lost).length || 0;
      const matched = items?.filter(item => item.status === 'matched').length || 0;
      const returned = items?.filter(item => item.status === 'returned').length || 0;

      setStats({ lost, found, matched, returned });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Achados e Perdidos</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral do sistema de achados e perdidos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-warning transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <CardDescription>Itens Perdidos</CardDescription>
              <CardTitle className="text-3xl">{stats.lost}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4 text-warning" />
                <span>Aguardando localização</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <CardDescription>Itens Encontrados</CardDescription>
              <CardTitle className="text-3xl">{stats.found}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="w-4 h-4 text-success" />
                <span>Disponíveis</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <CardDescription>Correspondências</CardDescription>
              <CardTitle className="text-3xl">{stats.matched}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Em processo</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <CardDescription>Devolvidos</CardDescription>
              <CardTitle className="text-3xl">{stats.returned}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Concluídos</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Registrar Item Perdido</CardTitle>
              <CardDescription>
                Registre um item que você perdeu para que possamos ajudá-lo a encontrá-lo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => navigate('/register-lost')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Item Perdido
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Registrar Item Encontrado</CardTitle>
              <CardDescription>
                Encontrou algo? Registre aqui para ajudar o proprietário a recuperá-lo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => navigate('/register-found')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Item Encontrado
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Buscar Itens</CardTitle>
              <CardDescription>
                Navegue pela lista de itens perdidos e encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/search-items')}
              >
                <Search className="w-4 h-4 mr-2" />
                Ver Todos os Itens
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Meus Itens</CardTitle>
              <CardDescription>
                Visualize e gerencie os itens que você registrou
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/my-items')}
              >
                <Package className="w-4 h-4 mr-2" />
                Meus Registros
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Correspondências</CardTitle>
              <CardDescription>
                Veja possíveis matches e gerencie o processo de devolução
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/matches')}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Ver Correspondências
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;