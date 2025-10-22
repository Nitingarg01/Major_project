export interface DBUser {
  _id: string | { toString(): string };
  name: string;
  email: string;
  password: string
}