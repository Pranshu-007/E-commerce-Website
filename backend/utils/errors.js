export class CheckoutError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
    this.name = 'CheckoutError';
  }
}
