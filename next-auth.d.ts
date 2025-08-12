import { AdapterUser } from "next-auth/adapters";

declare module "next-auth/adapters" {
  interface AdapterUser {
    credits?: number;
  }
}