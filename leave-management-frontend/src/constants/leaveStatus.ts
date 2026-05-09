/** Leave request statuses from the API */
export const LEAVE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export type LeaveStatus = (typeof LEAVE_STATUS)[keyof typeof LEAVE_STATUS];

export function normalizeLeaveStatus(raw: string | undefined | null): LeaveStatus | string {
  if (!raw) return LEAVE_STATUS.PENDING;
  const u = String(raw).toUpperCase();
  if (u === LEAVE_STATUS.PENDING) return LEAVE_STATUS.PENDING;
  if (u === LEAVE_STATUS.APPROVED) return LEAVE_STATUS.APPROVED;
  if (u === LEAVE_STATUS.REJECTED) return LEAVE_STATUS.REJECTED;
  if (u === LEAVE_STATUS.CANCELLED) return LEAVE_STATUS.CANCELLED;
  return u;
}
