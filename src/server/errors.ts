export type AppErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "AI_UNAVAILABLE"
  | "TTS_UNAVAILABLE"
  | "INTERNAL";

const STATUS: Record<AppErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  AI_UNAVAILABLE: 503,
  TTS_UNAVAILABLE: 503,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly publicMessage: string;

  constructor(code: AppErrorCode, publicMessage: string, internalMessage?: string) {
    super(internalMessage ?? publicMessage);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS[code];
    this.publicMessage = publicMessage;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function publicError(error: unknown): { status: number; message: string; code: string } {
  if (isAppError(error)) {
    return { status: error.status, message: error.publicMessage, code: error.code };
  }
  return {
    status: 500,
    message: "Kutilmagan xatolik. Qayta urinib ko'ring.",
    code: "INTERNAL",
  };
}
