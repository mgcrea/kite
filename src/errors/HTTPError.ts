import { KiteRequestInit } from '../core/KiteRequest';

export class HTTPError extends Error {
  public readonly name = 'HTTPError';
  constructor(
    public readonly response: Response,
    public readonly request: Request,
    public readonly options: Readonly<KiteRequestInit>
  ) {
    // Set the message to the status text, such as Unauthorized,
    // with some fallbacks. This message should never be undefined.
    super(
      response.statusText ||
        String(response.status === 0 || response.status ? response.status : 'Unknown response error')
    );
  }
}
