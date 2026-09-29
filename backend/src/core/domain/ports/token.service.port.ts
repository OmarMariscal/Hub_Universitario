export interface ITokenService {
  sign(payload: Record<string, any>): Promise<string>;
  verify<T extends object = any>(token: string): Promise<T>;
}
