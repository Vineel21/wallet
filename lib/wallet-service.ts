import { now, uid } from "@/lib/mock-data";
import type { SecurityEvent } from "@/lib/types";

export function addSecurityEvent(events: SecurityEvent[], userId: string, type: string, detail: string) {
  return [
    ...events,
    {
      id: uid("event"),
      userId,
      type,
      detail,
      createdAt: now()
    }
  ];
}
