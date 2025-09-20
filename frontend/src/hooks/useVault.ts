"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Vault {
  id: string;
  user_address: string;
  vault_name: string;
  description: string | null;
  created_at: string;
  initial_deposit: number;
}

export function useVault() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all vaults
  const fetchVaults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("vaults")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Check if it's a "table doesn't exist" error
        if (error.code === "42P01" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
          throw new Error("Vaults table not found. Please apply the database schema first by running: node scripts/apply-vault-schema.js");
        }
        throw new Error(error.message);
      }

      setVaults(data || []);
    } catch (err: any) {
      console.error("Error fetching vaults:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a vault
  const checkUserVault = async (userAddress: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("vaults")
        .select("id")
        .eq("user_address", userAddress)
        .single();

      if (error) {
        // Check if it's a "table doesn't exist" error
        if (error.code === "42P01" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
          console.warn("Vaults table not found. Please apply the database schema first.");
          return false;
        }
        
        // Check if it's a "not found" error (user doesn't have a vault)
        if (error.code === "PGRST116") {
          return false;
        }
        
        throw new Error(error.message);
      }

      return !!data;
    } catch (err: any) {
      console.error("Error checking user vault:", err);
      return false;
    }
  };

  // Check if vault name is unique
  const checkVaultNameUnique = async (vaultName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("vaults")
        .select("id")
        .eq("vault_name", vaultName)
        .single();

      if (error) {
        // Check if it's a "table doesn't exist" error
        if (error.code === "42P01" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
          console.warn("Vaults table not found. Please apply the database schema first.");
          return true; // Assume unique if table doesn't exist
        }
        
        // Check if it's a "not found" error (name is unique)
        if (error.code === "PGRST116") {
          return true;
        }
        
        throw new Error(error.message);
      }

      return !data; // Return true if no data found (name is unique)
    } catch (err: any) {
      console.error("Error checking vault name uniqueness:", err);
      return false;
    }
  };

  // Create a new vault
  const createVault = async (vaultData: {
    user_address: string;
    vault_name: string;
    description?: string;
    initial_deposit: number;
  }): Promise<Vault> => {
    try {
      const { data, error } = await supabase
        .from("vaults")
        .insert(vaultData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Refresh vaults list
      await fetchVaults();
      
      return data;
    } catch (err: any) {
      console.error("Error creating vault:", err);
      throw err;
    }
  };

  // Get vault by user address
  const getVaultByUser = async (userAddress: string): Promise<Vault | null> => {
    try {
      const { data, error } = await supabase
        .from("vaults")
        .select("*")
        .eq("user_address", userAddress)
        .single();

      if (error && error.code !== "PGRST116") {
        throw new Error(error.message);
      }

      return data || null;
    } catch (err: any) {
      console.error("Error fetching user vault:", err);
      return null;
    }
  };

  // Load vaults on mount
  useEffect(() => {
    fetchVaults();
  }, []);

  return {
    vaults,
    loading,
    error,
    fetchVaults,
    checkUserVault,
    checkVaultNameUnique,
    createVault,
    getVaultByUser,
  };
}