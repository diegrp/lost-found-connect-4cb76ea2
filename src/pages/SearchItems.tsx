import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, MapPin, User, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { getCategoryLabel } from "@/lib/translations";

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
  quantity: number;
}

export default function SearchItems() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [itemType, setItemType] = useState<"all" | "lost" | "found">("all");
  const [showOnlyMyItems, setShowOnlyMyItems] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, categoryFilter, itemType, showOnlyMyItems]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar itens: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    // Filter by user
    if (showOnlyMyItems) {
      filtered = filtered.filter((item) => item.user_id === user?.id);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    // Filter by item type - considerar também o status
    if (itemType === "lost") {
      filtered = filtered.filter((item) => item.is_lost && item.status === "lost");
    } else if (itemType === "found") {
      filtered = filtered.filter((item) => !item.is_lost && item.status === "found");
    }

    setFilteredItems(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "lost":
        return "bg-amber-500";
      case "found":
        return "bg-green-500";
      case "matched":
        return "bg-blue-500";
      case "claimed":
        return "bg-gray-500";
      case "returned":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string, isLost: boolean) => {
    switch (status) {
      case "lost":
        return "Perdido";
      case "found":
        return "Encontrado";
      case "matched":
        return "Match Encontrado";
      case "claimed":
        return "Encontrado pelo dono";
      case "returned":
        return "Encontrado pelo dono";
      default:
        return status;
    }
  };

  const handleFoundItem = async (item: Item) => {
    // Check if the current user is the owner of the item
    if (item.user_id === user?.id) {
      // Update the status to "found"
      try {
        const { error } = await supabase
          .from("items")
          .update({ status: "found", is_lost: false })
          .eq("id", item.id);

        if (error) throw error;

        // Refresh items
        fetchItems();

        // Show toast with undo action
        toast.success("Status atualizado para Encontrado", {
          action: {
            label: "Desfazer",
            onClick: async () => {
              const { error: undoError } = await supabase
                .from("items")
                .update({ status: "lost", is_lost: true })
                .eq("id", item.id);

              if (!undoError) {
                fetchItems();
                toast.info("Status revertido para Perdido");
              }
            },
          },
          style: {
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            border: "none",
          },
        });
      } catch (error: any) {
        toast.error("Erro ao atualizar status: " + error.message);
      }
    } else {
      // Navigate to register found item page with pre-filled data
      navigate("/register-found-item", {
        state: {
          prefilledItem: {
            title: item.title,
            description: item.description,
            category: item.category,
            image_url: item.image_url,
            quantity: item.quantity,
          }
        }
      });
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Buscar Itens</h1>
          <p className="text-muted-foreground">Navegue pela lista de itens perdidos e encontrados</p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, descrição ou localização..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="electronics">Eletrônicos</SelectItem>
                <SelectItem value="clothing">Roupas</SelectItem>
                <SelectItem value="accessories">Acessórios</SelectItem>
                <SelectItem value="documents">Documentos</SelectItem>
                <SelectItem value="keys">Chaves</SelectItem>
                <SelectItem value="bags">Bolsas/Mochilas</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showOnlyMyItems ? "default" : "outline"}
              onClick={() => setShowOnlyMyItems(!showOnlyMyItems)}
            >
              {showOnlyMyItems ? "Meus Itens" : "Todos os Itens"}
            </Button>
          </div>

          <Tabs value={itemType} onValueChange={(v) => setItemType(v as any)} className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="lost">Perdidos</TabsTrigger>
              <TabsTrigger value="found">Encontrados</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Nenhum item encontrado</p>
            </div>
          ) : (
            filteredItems.map((item) => (
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
                      {getStatusLabel(item.status, item.is_lost)}
                    </Badge>
                    <Badge variant="outline">{getCategoryLabel(item.category)}</Badge>
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
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
                  {item.is_lost && item.status === "lost" && (
                    <Button 
                      onClick={() => handleFoundItem(item)}
                      className="w-full"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Encontrei esse item
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
