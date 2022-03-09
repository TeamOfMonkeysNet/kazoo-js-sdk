export type AuthEndpoint = "user_auth" | "desktop_auth";

export interface ClientConfig {
  host: string;
  authEndpoint?: AuthEndpoint;
}
