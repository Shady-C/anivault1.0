export interface User {
  id: string;
  name: string;
  avatar_url: string | null;
  email: string;
  theme: "light" | "dark" | "system";
  notification_preferences: {
    vault_add: boolean;
    recommendations: boolean;
    airing: boolean;
  };
  created_at: string;
}

export interface UserFollow {
  user_id: string;
  upcoming_anime_id: string;
  created_at: string;
}

export type NotificationType = "vault_add" | "vault_invite" | "recommendation";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}
