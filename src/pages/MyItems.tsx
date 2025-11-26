import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, MapPin, User, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date_lost_or_found: string;
  is_lost: boolean;
  status: string;
  image_url?: string;
  contact_info?: string;
  user_id: string;
}

export default function MyItems() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMyItems();
    }
  }, [user]);

  const fetchMyItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar seus itens: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemStatus = async (itemId: string, newStatus: "lost" | "found" | "claimed" | "matched" | "returned") => {
    try {
      const { error } = await supabase
        .from("items")
        .update({ status: newStatus })
        .eq("id", itemId);

      if (error) throw error;

      toast.success("Status atualizado com sucesso!");
      fetchMyItems();
    } catch (error: any) {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast.success("Item excluído com sucesso!");
      fetchMyItems();
    } catch (error: any) {
      toast.error("Erro ao excluir item: " + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "lost":
        return "bg-amber-500";
      case "found":
        return "bg-green-500";
      case "claimed":
        return "bg-blue-500";
      case "returned":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "lost":
        return "Perdido";
      case "found":
        return "Encontrado";
      case "claimed":
        return "Reivindicado";
      case "returned":
        return "Devolvido";
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "electronics":
        return "Eletrônicos";
      case "documents":
        return "Documentos";
      case "clothing":
        return "Roupas";
      case "accessories":
        return "Acessórios";
      case "bags":
        return "Bolsas/Mochilas";
      case "keys":
        return "Chaves";
      case "jewelry":
        return "Joias";
      case "sports":
        return "Artigos Esportivos";
      case "books":
        return "Livros";
      case "other":
        return "Outros";
      default:
        return category;
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-4">
            Voltar ao Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">Meus Itens</h1>
          <p className="text-muted-foreground">Visualize e gerencie os itens que você registrou</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground mb-4">Você ainda não registrou nenhum item</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate("/register-lost-item")}>
                  Registrar Item Perdido
                </Button>
                <Button onClick={() => navigate("/register-found-item")} variant="outline">
                  Registrar Item Encontrado
                </Button>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                {item.image_url && (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                    <Badge variant="outline">{getCategoryLabel(item.category)}</Badge>
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(item.date_lost_or_found).toLocaleDateString("pt-BR")}</span>
                      </div>
                      {item.contact_info && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{item.contact_info}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t">
                      <label className="text-sm font-medium mb-2 block">Atualizar Status:</label>
                      <Select
                        value={item.status}
                        onValueChange={(value) => updateItemStatus(item.id, value as "lost" | "found" | "claimed" | "matched" | "returned")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lost">Perdido</SelectItem>
                          <SelectItem value="found">Encontrado</SelectItem>
                          <SelectItem value="claimed">Reivindicado</SelectItem>
                          <SelectItem value="returned">Devolvido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/edit-item/${item.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="flex-1">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteItem(item.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
