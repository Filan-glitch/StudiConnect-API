/**
 * Error thrown when a resource is not found.
 */
class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export default NotFoundError;
