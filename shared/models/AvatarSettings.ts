export type AvatarSettings = {
  body: number;
  mouth: number;
  eyes: number;
};

export const DefaultAvatar: AvatarSettings = { body: 0, mouth: 0, eyes: 0 };

export function GetRandomAvatar(): AvatarSettings {
  return {
    body: Math.floor(Math.random() * 3),
    mouth: Math.floor(Math.random() * 2),
    eyes: Math.floor(Math.random() * 4),
  };
}
