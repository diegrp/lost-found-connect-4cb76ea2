import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const EditItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date_lost_or_found: "",
    location: "",
    contact_info: "",
    image_url: "",
    is_lost: false
  });

  const categories = [
    "electronics",
    "documents",
    "clothing",
    "accessories",
    "bags",
    "keys",
    "jewelry",
    "sports",
    "books",
    "other"
  ];

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchItem();
  }, [id, user]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error("Item não encontrado");
        navigate("/my-items");
        return;
      }

      setFormData({
        title: data.title,
        description: data.description,
        category: data.category,
        date_lost_or_found: data.date_lost_or_found,
        location: data.location || "",
        contact_info: data.contact_info || "",
        image_url: data.image_url || "",
        is_lost: data.is_lost
      });
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar item");
      navigate("/my-items");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar autenticado");
      return;
    }

    setIsLoading(true);

    try {
      const itemData: TablesUpdate<"items"> = {
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        date_lost_or_found: formData.date_lost_or_found,
        location: formData.location || null,
        contact_info: formData.contact_info || null,
        image_url: formData.image_url || null,
      };

      const { error } = await supabase
        .from("items")
        .update(itemData)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Item atualizado com sucesso!");
      navigate("/my-items");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar item");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/my-items")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar aos Meus Itens
        </Button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            Editar {formData.is_lost ? "Item Perdido" : "Item Encontrado"}
          </h1>
          <p className="text-muted-foreground mb-8">
            Atualize as informações do seu item.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Item *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: iPhone 13 Pro Max Preto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Detalhada *</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o item em detalhes..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  required
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  Data {formData.is_lost ? "da Perda" : "que Encontrou"} *
                </Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date_lost_or_found}
                  onChange={(e) => setFormData({ ...formData, date_lost_or_found: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Local {formData.is_lost ? "da Perda" : "onde Encontrou"}
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Shopping Center, Setor A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Informações de Contato</Label>
              <Input
                id="contact"
                value={formData.contact_info}
                onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                placeholder="Telefone ou e-mail"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL da Imagem</Label>
              <Input
                id="image"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <p className="text-sm text-muted-foreground">
                Opcional: Cole o link de uma imagem do item
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/my-items")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItem;
