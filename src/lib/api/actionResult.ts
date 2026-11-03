/**
 * What every Server Action answers (ADR-0006). Failures carry what the BFF
 * routes used to send as JSON, so forms keep showing the same messages.
 * Types only: shared by the actions and the browser.
 */
export type ActionFailure = {
  ok: false;
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
  /** Stable backend error code (`E_*`, backend ADR-0034), when known. */
  code?: string;
};

export type ActionResult<T> = { ok: true; data: T } | ActionFailure;
