import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Material, ExamType, SubjectType, ResourceType } from "@/types/materials";

// Priority materials that should always appear first (ordered by rank)
const PRIORITY_MATERIALS = [
  "ALL IN ONE LN MATERIAL",
  "AIR 48 NOTES",
  "HC VERMA",
  "CENGAGE BOOKS",
  "IRODOV",
  "MS CHAUHAN (LATEST)",
  "NCERT",
  "PHYSICS GALAXY",
  "MS CHOUHAN",
  "ARJUNA AIR MODULES",
  "LAKSHYA AIR MODULES",
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
  return useQuery({
    queryKey: ["materials"],
    queryFn: async (): Promise<Material[]> => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .order("popularity", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Sort by priority rank first, then by popularity, then by badge presence
      const sortedData = (data as Material[]).sort((a, b) => {
        const rankA = getPriorityRank(a.name);
        const rankB = getPriorityRank(b.name);
        
        // Priority rank first
        if (rankA !== rankB) return rankA - rankB;
        
        // Then by badge (premium > air > core > none)
        const badgeOrder = { premium: 1, air: 2, core: 3 };
        const badgeA = a.badge ? badgeOrder[a.badge as keyof typeof badgeOrder] || 4 : 4;
        const badgeB = b.badge ? badgeOrder[b.badge as keyof typeof badgeOrder] || 4 : 4;
        if (badgeA !== badgeB) return badgeA - badgeB;
        
        // Then by popularity
        return (b.popularity || 0) - (a.popularity || 0);
      });
      
      return sortedData;
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
