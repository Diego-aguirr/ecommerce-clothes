import { z } from "zod";
import { webhookSchema } from "@/lib/zod";

export type WebhookPayload = z.infer<typeof webhookSchema>;
