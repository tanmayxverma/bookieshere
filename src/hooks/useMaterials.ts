import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Material, ExamType, SubjectType, ResourceType } from "@/types/materials";
import { DEFAULT_MATERIALS } from "@/data/materialsData";
import { useEffect } from "react";

// Priority materials that should always appear first (ordered by rank)
const PRIORITY_MATERIALS = [
  "HC VERMA",
  "CENGAGE",
  "IRODOV",
  "BLACKBOOK",
  "MS CHOUHAN",
  "N AWASTHI",
  "PHYSICS GALAXY",
  "PATHFINDER",
  "ALLEN",
  "FIITJEE",
  "ARJUNA AIR",
  "LAKSHYA AIR",
  "PRAYAS AIR",
];

function getPriorityRank(materialName: string): number {
  const upperName = materialName.toUpperCase();
  for (let i = 0; i < PRIORITY_MATERIALS.length; i++) {
    if (upperName.includes(PRIORITY_MATERIALS[i])) {
      return i + 1;
    }
  }
  return 99; // Non-priority materials
}

export function useMaterials() {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel('materials-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, () => {
        qc.invalidateQueries({ queryKey: ['materials'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return useQuery({
    queryKey: ["materials"],
    queryFn: async (): Promise<Material[]> => {
      try {
        const { data, error } = await supabase
          .from("materials")
          .select("*")
          .order("popularity", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Supabase materials query warning, falling back to local dataset:", error.message);
          return DEFAULT_MATERIALS;
        }

        const list: Material[] = (data && data.length > 0) ? (data as Material[]) : DEFAULT_MATERIALS;

        // Sort by priority rank first, then by popularity, then by badge presence
        const sortedData = [...list].sort((a, b) => {
          const rankA = getPriorityRank(a.name);
          const rankB = getPriorityRank(b.name);
          
          // Priority rank first
          if (rankA !== rankB) return rankA - rankB;
          
          // Then by badge (premium > air > core > new)
          const badgeOrder: Record<string, number> = { premium: 1, air: 2, core: 3, new: 4, updated: 5 };
          const badgeA = a.badge ? badgeOrder[a.badge] || 6 : 6;
          const badgeB = b.badge ? badgeOrder[b.badge] || 6 : 6;
          if (badgeA !== badgeB) return badgeA - badgeB;
          
          // Then by popularity
          return (b.popularity || 0) - (a.popularity || 0);
        });
        
        return sortedData;
      } catch (err) {
        console.warn("Falling back to local materials dataset:", err);
        return DEFAULT_MATERIALS;
      }
    },
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (material: Omit<Material, "id" | "created_at" | "updated_at" | "popularity" | "badge">) => {
      const { data, error } = await supabase
        .from("materials")
        .insert({ ...material, popularity: 0 })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...material }: Partial<Material> & { id: string }) => {
      const { data, error } = await supabase
        .from("materials")
        .update(material)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("materials")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}
