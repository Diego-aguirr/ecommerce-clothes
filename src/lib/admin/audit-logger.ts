import prisma from "@/lib/prisma";

export interface AuditLogData {
  adminId: string;
  action: string;
  targetId?: string;
  metadata?: any;
  entity?: string;
}

export async function logAdminAction(data: AuditLogData) {
  try {
    let derivedEntity = data.entity || "System";
    
    // Auto-derive entity if not provided, based on action name
    if (!data.entity) {
      const actionUpper = data.action.toUpperCase();
      if (actionUpper.includes("ORDER")) derivedEntity = "Order";
      else if (actionUpper.includes("PRODUCT") || actionUpper.includes("STOCK")) derivedEntity = "Product";
      else if (actionUpper.includes("USER")) derivedEntity = "User";
      else if (actionUpper.includes("CATEGORY")) derivedEntity = "Category";
    }

    await prisma.auditLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        entity: derivedEntity,
        targetId: data.targetId,
        metadata: data.metadata || undefined,
      },
    });
  } catch (error) {
    console.error("[AUDIT LOG ERROR] Fallo al crear trazabilidad de auditoría:", error);
    // Fallback silencioso para no romper la acción principal, aunque se loggea el error en el servidor.
  }
}
