/**
 * Error thrown when a user tries to access a resource without the required permissions.
 */
class NoPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoPermissionError";
  }
}

export default NoPermissionError;
