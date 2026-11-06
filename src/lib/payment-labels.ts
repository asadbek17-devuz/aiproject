import type { PaymentStatus } from "@prisma/client";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Kutilmoqda",
  PAID: "To'langan",
  FAILED: "Muvaffaqiyatsiz",
  REFUNDED: "Qaytarilgan",
};
