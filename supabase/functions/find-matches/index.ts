import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar itens perdidos que ainda não estão matched/claimed/returned
    const { data: lostItems, error: lostError } = await supabase
      .from('items')
      .select('*')
      .eq('is_lost', true)
      .in('status', ['lost']);

    if (lostError) throw lostError;

    // Buscar itens encontrados que ainda não estão matched/claimed/returned
    const { data: foundItems, error: foundError } = await supabase
      .from('items')
      .select('*')
      .eq('is_lost', false)
      .in('status', ['found']);

    if (foundError) throw foundError;

    const matches = [];

    // Para cada item perdido, calcular score com itens encontrados
    for (const lostItem of lostItems || []) {
      for (const foundItem of foundItems || []) {
        // Não permitir match entre itens do mesmo usuário
        if (lostItem.user_id === foundItem.user_id) {
          continue;
        }

        let score = 0;

        // Mesma categoria: +40 pontos
        if (lostItem.category === foundItem.category) {
          score += 40;
        }

        // Localização similar: +30 pontos
        if (lostItem.location && foundItem.location) {
          const lostLoc = lostItem.location.toLowerCase();
          const foundLoc = foundItem.location.toLowerCase();
          if (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc)) {
            score += 30;
          }
        }

        // Data próxima (diferença de até 7 dias): +20 pontos
        const lostDate = new Date(lostItem.date_lost_or_found);
        const foundDate = new Date(foundItem.date_lost_or_found);
        const daysDiff = Math.abs((lostDate.getTime() - foundDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) {
          score += 20;
        }

        // Palavras-chave similares na descrição: +10 pontos
        const lostWords = lostItem.description.toLowerCase().split(/\s+/);
        const foundWords = foundItem.description.toLowerCase().split(/\s+/);
        const commonWords = lostWords.filter((word: string) => 
          word.length > 3 && foundWords.includes(word)
        );
        if (commonWords.length > 0) {
          score += 10;
        }

        // Se o score for maior que 50, é um match viável
        if (score >= 50) {
          // Verificar se já existe esse match
          const { data: existingMatch } = await supabase
            .from('matches')
            .select('*')
            .eq('lost_item_id', lostItem.id)
            .eq('found_item_id', foundItem.id)
            .single();

          if (!existingMatch) {
            matches.push({
              lost_item_id: lostItem.id,
              found_item_id: foundItem.id,
              match_score: score,
              status: 'pending'
            });
          }
        }
      }
    }

    // Inserir matches no banco
    if (matches.length > 0) {
      const { error: insertError } = await supabase
        .from('matches')
        .insert(matches);

      if (insertError) throw insertError;
    }

    console.log(`Found ${matches.length} new matches`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        matchesFound: matches.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in find-matches function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});