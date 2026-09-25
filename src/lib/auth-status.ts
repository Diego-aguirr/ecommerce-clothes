/**
 * Fail-closed user status gate.
 *
 * Only an explicit "ACTIVE" status grants access. BLOCKED, DELETED,
 * and missing status (undefined/null) all deny.
 */
export function isStatusActive(status: string | null | undefined): boolean {
  return status === "ACTIVE";
}
