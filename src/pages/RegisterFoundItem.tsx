import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { TablesInsert } from "@/integrations/supabase/types";

const RegisterFoundItem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date_lost_or_found: "",
    location: "",
    contact_info: "",
    image_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado");
      navigate("/auth");
      return;
    }

    if (!formData.category) {
      toast.error("Selecione uma categoria");
      return;
    }

    setLoading(true);

    try {
      // Verificar se já existe um item com o mesmo título e imagem
      let query = supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id)
        .eq("title", formData.title.trim())
        .in("status", ["lost", "found", "matched"]);

      // Se houver imagem, incluir na verificação
      if (formData.image_url) {
        query = query.eq("image_url", formData.image_url.trim());
      }

      const { data: existingItems, error: checkError } = await query;

      if (checkError) throw checkError;

      if (existingItems && existingItems.length > 0) {
        toast.error(
          "Você já tem um item cadastrado com o mesmo título" + 
          (formData.image_url ? " e imagem" : "") + 
          ". Por favor, atualize o item existente ou use um título diferente.",
          { duration: 6000 }
        );
        setLoading(false);
        return;
      }

      const itemData: TablesInsert<"items"> = {
        title: formData.title,
        description: formData.description,
        category: formData.category as TablesInsert<"items">["category"],
        date_lost_or_found: formData.date_lost_or_found,
        location: formData.location || null,
        contact_info: formData.contact_info || null,
        image_url: formData.image_url || null,
        user_id: user.id,
        is_lost: false,
        status: "found",
      };

      const { error } = await supabase
        .from("items")
        .insert(itemData);

      if (error) throw error;

      toast.success("Item encontrado registrado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Item Encontrado</CardTitle>
            <CardDescription>
              Preencha as informações do item que você encontrou
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Carteira marrom"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o item em detalhes..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Eletrônicos</SelectItem>
                    <SelectItem value="documents">Documentos</SelectItem>
                    <SelectItem value="clothing">Roupas</SelectItem>
                    <SelectItem value="accessories">Acessórios</SelectItem>
                    <SelectItem value="bags">Bolsas/Mochilas</SelectItem>
                    <SelectItem value="keys">Chaves</SelectItem>
                    <SelectItem value="jewelry">Joias</SelectItem>
                    <SelectItem value="sports">Artigos Esportivos</SelectItem>
                    <SelectItem value="books">Livros</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Data em que encontrou *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date_lost_or_found}
                  onChange={(e) => setFormData({ ...formData, date_lost_or_found: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Local onde encontrou</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Recepção, Sala 201"
                />
              </div>

              <div>
                <Label htmlFor="contact">Informações de contato</Label>
                <Input
                  id="contact"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                  placeholder="Seu email ou telefone"
                />
              </div>

              <div>
                <Label htmlFor="image">URL da Imagem</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Registrando..." : "Registrar Item"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default RegisterFoundItem;
