"use client";

import { useEffect } from "react";
import { hydrateFromCloud, startSync } from "@/lib/cloud-sync";
import { onChange } from "@/lib/subscription";

/** Mounts the cross-device sync: pulls on load/subscription-change, pushes on
 *  local edits. No-op for free/unauthenticated users. */
export default function SyncManager() {
  useEffect(() => {
    const stopSync = startSync();
    void hydrateFromCloud();
    const offSub = onChange(() => void hydrateFromCloud());
    return () => {
      stopSync();
      offSub();
    };
  }, []);
  return null;
}
