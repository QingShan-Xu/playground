export const E_ERROR_TYPE = {
  DATABASE_DRIVER_ERROR: 'DATABASE_DRIVER_ERROR',
  DEPENDENCY_DOWNLOAD_ERROR: 'DEPENDENCY_DOWNLOAD_ERROR'
} as const;

export class PlaygroundError extends Error {
  type: typeof E_ERROR_TYPE[keyof typeof E_ERROR_TYPE];

  constructor(
    message: string,
    type: keyof typeof E_ERROR_TYPE
  ) {
    super(message);
    this.type = E_ERROR_TYPE[type];
    this.name = 'PlaygroundError';
  }
}
