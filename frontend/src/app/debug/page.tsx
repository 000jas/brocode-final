"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testAddress, setTestAddress] = useState("0x1234567890123456789012345678901234567890");

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    addLog("🔗 Testing Supabase connection...");
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        addLog(`❌ Connection failed: ${error.message}`);
        addLog(`Error code: ${error.code}`);
        addLog(`Error details: ${JSON.stringify(error)}`);
      } else {
        addLog(`✅ Connected successfully! Found ${data.length} profiles`);
      }
    } catch (error: any) {
      addLog(`❌ Connection error: ${error.message}`);
    }
  };

  const testProfileCreation = async () => {
    addLog(`👤 Testing profile creation for: ${testAddress}`);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          wallet_address: testAddress
        })
        .select()
        .single();
      
      if (error) {
        addLog(`❌ Profile creation failed: ${error.message}`);
        addLog(`Error code: ${error.code}`);
        addLog(`Error details: ${JSON.stringify(error)}`);
      } else {
        addLog(`✅ Profile created successfully! ID: ${data.id}`);
        addLog(`Profile data: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      addLog(`❌ Profile creation error: ${error.message}`);
    }
  };

  const checkExistingProfiles = async () => {
    addLog("📋 Checking existing profiles...");
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        addLog(`❌ Error fetching profiles: ${error.message}`);
      } else {
        addLog(`📊 Found ${data.length} profiles:`);
        data.forEach(profile => {
          addLog(`  - ID: ${profile.id}, Address: ${profile.wallet_address}, Created: ${profile.created_at}`);
        });
      }
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Debug Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl w-full">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Wallet Address:
          </label>
          <input
            type="text"
            value={testAddress}
            onChange={(e) => setTestAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter wallet address to test"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button onClick={testConnection} className="w-full">
            Test Connection
          </Button>
          <Button onClick={testProfileCreation} className="w-full">
            Test Profile Creation
          </Button>
          <Button onClick={checkExistingProfiles} className="w-full">
            Check Existing Profiles
          </Button>
          <Button onClick={clearLogs} variant="outline" className="w-full">
            Clear Logs
          </Button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Debug Logs:</h3>
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Click a button to start testing.</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
