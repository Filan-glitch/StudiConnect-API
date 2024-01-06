/**
 * Error thrown when a user tries to create a resource that already exists.
 */
class DuplicateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateError";
  }
}

export default DuplicateError;
