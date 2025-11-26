import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowRight, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

interface Match {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  match_score: number;
  status: string;
  created_at: string;
  lost_item: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    date_lost_or_found: string;
    image_url?: string;
    user_id: string;
  };
  found_item: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    date_lost_or_found: string;
    image_url?: string;
    user_id: string;
  };
}

export default function Matches() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFindingMatches, setIsFindingMatches] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      
      // Buscar matches onde o usuário é dono do item perdido ou encontrado
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          lost_item:items!matches_lost_item_id_fkey(*),
          found_item:items!matches_found_item_id_fkey(*)
        `)
        .order("match_score", { ascending: false });

      if (error) throw error;

      // Filtrar apenas matches relevantes ao usuário
      const userMatches = (data || []).filter(
        (match: any) =>
          match.lost_item.user_id === user?.id ||
          match.found_item.user_id === user?.id
      );

      setMatches(userMatches);
    } catch (error: any) {
      toast.error("Erro ao carregar correspondências: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const findNewMatches = async () => {
    try {
      setIsFindingMatches(true);
      const { data, error } = await supabase.functions.invoke("find-matches");

      if (error) throw error;

      toast.success(`Busca concluída! ${data.matchesFound} novas correspondências encontradas.`);
      fetchMatches();
    } catch (error: any) {
      toast.error("Erro ao buscar correspondências: " + error.message);
    } finally {
      setIsFindingMatches(false);
    }
  };

  const acceptMatch = async (matchId: string, lostItemId: string, foundItemId: string) => {
    try {
      // Atualizar status dos itens para "matched"
      const { error: lostError } = await supabase
        .from("items")
        .update({ status: "matched" })
        .eq("id", lostItemId);

      if (lostError) throw lostError;

      const { error: foundError } = await supabase
        .from("items")
        .update({ status: "matched" })
        .eq("id", foundItemId);

      if (foundError) throw foundError;

      // Atualizar status do match
      const { error: matchError } = await supabase
        .from("matches")
        .update({ status: "accepted" })
        .eq("id", matchId);

      if (matchError) throw matchError;

      toast.success("Correspondência aceita! Os itens foram marcados como encontrados.");
      fetchMatches();
    } catch (error: any) {
      toast.error("Erro ao aceitar correspondência: " + error.message);
    }
  };

  const markAsClaimed = async (matchId: string, lostItemId: string, foundItemId: string) => {
    try {
      // Atualizar status dos itens para "claimed"
      const { error: lostError } = await supabase
        .from("items")
        .update({ status: "claimed" })
        .eq("id", lostItemId);

      if (lostError) throw lostError;

      const { error: foundError } = await supabase
        .from("items")
        .update({ status: "claimed" })
        .eq("id", foundItemId);

      if (foundError) throw foundError;

      // Atualizar status do match
      const { error: matchError } = await supabase
        .from("matches")
        .update({ status: "claimed" })
        .eq("id", matchId);

      if (matchError) throw matchError;

      toast.success("Item marcado como reclamado pelo dono!");
      fetchMatches();
    } catch (error: any) {
      toast.error("Erro ao marcar como reclamado: " + error.message);
    }
  };

  const markAsReturned = async (matchId: string, lostItemId: string, foundItemId: string) => {
    try {
      // Atualizar status dos itens para "returned"
      const { error: lostError } = await supabase
        .from("items")
        .update({ status: "returned" })
        .eq("id", lostItemId);

      if (lostError) throw lostError;

      const { error: foundError } = await supabase
        .from("items")
        .update({ status: "returned" })
        .eq("id", foundItemId);

      if (foundError) throw foundError;

      // Atualizar status do match
      const { error: matchError } = await supabase
        .from("matches")
        .update({ status: "returned" })
        .eq("id", matchId);

      if (matchError) throw matchError;

      toast.success("Item marcado como devolvido! Processo concluído.");
      fetchMatches();
    } catch (error: any) {
      toast.error("Erro ao marcar como devolvido: " + error.message);
    }
  };

  const rejectMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: "rejected" })
        .eq("id", matchId);

      if (error) throw error;

      toast.success("Correspondência rejeitada.");
      fetchMatches();
    } catch (error: any) {
      toast.error("Erro ao rejeitar correspondência: " + error.message);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    return "bg-amber-500";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      pending: { label: "Pendente", variant: "outline" },
      accepted: { label: "Aceito", variant: "default" },
      claimed: { label: "Reclamado", variant: "secondary" },
      returned: { label: "Devolvido", variant: "default" },
      rejected: { label: "Rejeitado", variant: "destructive" }
    };
    
    const config = statusMap[status] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-4">
              Voltar ao Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-foreground mb-2">Correspondências</h1>
            <p className="text-muted-foreground">
              Possíveis matches entre itens perdidos e encontrados
            </p>
          </div>
          <Button onClick={findNewMatches} disabled={isFindingMatches}>
            {isFindingMatches ? "Buscando..." : "Buscar Novas Correspondências"}
          </Button>
        </div>

        <div className="space-y-6">
          {matches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nenhuma correspondência encontrada ainda.
                  <br />
                  Clique em "Buscar Novas Correspondências" para encontrar matches.
                </p>
              </CardContent>
            </Card>
          ) : (
            matches.map((match) => (
              <Card key={match.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Badge className={getMatchScoreColor(match.match_score)}>
                        {match.match_score}% match
                      </Badge>
                      {getStatusBadge(match.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(match.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Item Perdido */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="bg-amber-500/10">
                          Item Perdido
                        </Badge>
                      </div>
                      {match.lost_item.image_url && (
                        <img
                          src={match.lost_item.image_url}
                          alt={match.lost_item.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {match.lost_item.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {match.lost_item.description}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{match.lost_item.category}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{match.lost_item.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(match.lost_item.date_lost_or_found).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seta de conexão */}
                    <div className="hidden md:flex items-center justify-center">
                      <ArrowRight className="h-8 w-8 text-muted-foreground" />
                    </div>

                    {/* Item Encontrado */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="bg-green-500/10">
                          Item Encontrado
                        </Badge>
                      </div>
                      {match.found_item.image_url && (
                        <img
                          src={match.found_item.image_url}
                          alt={match.found_item.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {match.found_item.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {match.found_item.description}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{match.found_item.category}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{match.found_item.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(match.found_item.date_lost_or_found).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="mt-6 pt-6 border-t flex gap-3 flex-wrap">
                    {match.status === "pending" && (
                      <>
                        <Button
                          onClick={() =>
                            acceptMatch(match.id, match.lost_item_id, match.found_item_id)
                          }
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aceitar Correspondência
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => rejectMatch(match.id)}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Rejeitar
                        </Button>
                      </>
                    )}
                    {match.status === "accepted" && (
                      <Button
                        onClick={() =>
                          markAsClaimed(match.id, match.lost_item_id, match.found_item_id)
                        }
                      >
                        Marcar como Reclamado
                      </Button>
                    )}
                    {match.status === "claimed" && (
                      <Button
                        onClick={() =>
                          markAsReturned(match.id, match.lost_item_id, match.found_item_id)
                        }
                      >
                        Marcar como Devolvido
                      </Button>
                    )}
                    {match.status === "returned" && (
                      <Badge variant="default" className="px-4 py-2">
                        Processo Concluído ✓
                      </Badge>
                    )}
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
