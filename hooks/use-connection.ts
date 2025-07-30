"use client";

import { create } from "zustand";
import { Connection } from "@/types/connection";

interface ConnectionState {
  activeConnection: Connection | null;
  setActiveConnection: (connection: Connection | null) => void;
}

export const useConnection = create<ConnectionState>((set) => ({
  activeConnection: null,
  setActiveConnection: (connection) => set({ activeConnection: connection }),
}));
