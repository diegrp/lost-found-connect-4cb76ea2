import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const RegisterLostItem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date_lost_or_found: "",
    location: "",
    contact_info: "",
    image_url: ""
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar autenticado");
      return;
    }

    setIsLoading(true);

    try {
      const itemData: TablesInsert<"items"> = {
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        date_lost_or_found: formData.date_lost_or_found,
        location: formData.location || null,
        contact_info: formData.contact_info || null,
        image_url: formData.image_url || null,
        is_lost: true,
        status: "lost",
        user_id: user.id
      };

      const { error } = await supabase.from("items").insert(itemData);

      if (error) throw error;

      toast.success("Item perdido registrado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Registrar Item Perdido</h1>
          <p className="text-muted-foreground mb-8">
            Preencha os detalhes do item que você perdeu para que possamos ajudar a encontrá-lo.
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

              <div className="space-y-2">
                <Label htmlFor="date">Data da Perda *</Label>
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
              <Label htmlFor="location">Local da Perda</Label>
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
                {isLoading ? "Registrando..." : "Registrar Item Perdido"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
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

export default RegisterLostItem;
