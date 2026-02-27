import type { AvatarSettings } from "@shared/models/AvatarSettings.js";

export type JoinLobbyRequest = {
  lobbyId: string;
  playerId: string;
  name: string;
  avatarSettings: AvatarSettings;
};
export type JoinLobbyHostRequest = {
  lobbyId: string;
};

export type JoinLobbyResponse = {
  success: boolean;
  reason?: string;
  lobbyId?: string;
  playerId?: string;
};

export type JoinLobbyHostResponse = {
  success: boolean;
  reason?: string;
  lobbyId?: string;
};
