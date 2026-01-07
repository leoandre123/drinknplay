export const DefaultAvatar = {
  body: 0,
  mouth: 0,
  eyes: 0,
};

export function GetRandomAvatar() {
  return {
    body: Math.floor(Math.random() * 3),
    mouth: Math.floor(Math.random() * 2),
    eyes: Math.floor(Math.random() * 4),
  };
}
