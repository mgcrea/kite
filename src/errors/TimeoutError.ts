export class TimeoutError extends Error {
  public readonly name = 'TimeoutError';
  constructor(public readonly request: Request) {
    super('Request timed out');
  }
}
