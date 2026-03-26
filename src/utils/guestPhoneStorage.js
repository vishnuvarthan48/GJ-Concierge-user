const storageKey = (tenantId, roomId) =>
  `conciergeGuestPhone:${tenantId}:${roomId}`;

export function getStoredGuestPhone(tenantId, roomId) {
  if (!tenantId || !roomId) return "";
  try {
    return localStorage.getItem(storageKey(tenantId, roomId)) || "";
  } catch {
    return "";
  }
}

export function setStoredGuestPhone(tenantId, roomId, phone) {
  const trimmed = typeof phone === "string" ? phone.trim() : "";
  if (!tenantId || !roomId || !trimmed) return;
  try {
    localStorage.setItem(storageKey(tenantId, roomId), trimmed);
  } catch {
    /* ignore quota / private mode */
  }
}
