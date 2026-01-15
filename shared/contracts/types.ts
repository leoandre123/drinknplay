export type JoinLobbyRequest = {};

export type JoinLobbyResponse = {
  success: boolean;
  reason?: string;
  lobbyId?: string;
  playerId?: string;
};
