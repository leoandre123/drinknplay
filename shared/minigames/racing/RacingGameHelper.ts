import { angleBetween, distance } from "@shared/utils/MathHelper.js";

export function isOnTrack(
  x: number,
  y: number,
  trackData: string[][],
  tileSize: number,
  roadWidth: number,
) {
  const roadMargin = (tileSize - roadWidth) / 2;

  const tileX = Math.floor(x / tileSize);
  const tileY = Math.floor(y / tileSize);

  const subTileX = x % tileSize;
  const subTileY = y % tileSize;

  const currentTile = trackData[tileY][tileX];

  switch (currentTile) {
    case "─":
      return subTileY > roadMargin && subTileY < roadMargin + roadWidth;
    case "│":
      return subTileX > roadMargin && subTileX < roadMargin + roadWidth;
    case "┌": {
      const dist = distance(tileSize, tileSize, subTileX, subTileY);
      return dist > roadMargin && dist < roadMargin + roadWidth;
    }
    case "┐": {
      const dist = distance(0, tileSize, subTileX, subTileY);
      return dist > roadMargin && dist < roadMargin + roadWidth;
    }
    case "┘": {
      const dist = distance(0, 0, subTileX, subTileY);
      return dist > roadMargin && dist < roadMargin + roadWidth;
    }
    case "└": {
      const dist = distance(tileSize, 0, subTileX, subTileY);
      return dist > roadMargin && dist < roadMargin + roadWidth;
    }
    default:
      return false;
  }
}

export function isWall(
  x: number,
  y: number,
  trackData: string[][],
  tileSize: number,
  wallWidth: number,
) {
  const tileX = Math.floor(x / tileSize);
  const tileY = Math.floor(y / tileSize);

  const subTileX = x % tileSize;
  const subTileY = y % tileSize;

  const currentTile = trackData[tileY][tileX];

  switch (currentTile) {
    case "─":
      if (subTileY < wallWidth) return { isWall: true, wallNormal: Math.PI / 2 };
      if (subTileY > tileSize - wallWidth) return { isWall: true, wallNormal: -Math.PI / 2 };
      return { isWall: false, wallNormal: undefined };
    case "│":
      if (subTileX < wallWidth) return { isWall: true, wallNormal: 0 };
      if (subTileX > tileSize - wallWidth) return { isWall: true, wallNormal: Math.PI };
      return { isWall: false, wallNormal: undefined };
    case "┌": {
      const dist = distance(tileSize, tileSize, subTileX, subTileY);
      const angle = angleBetween(tileSize, tileSize, subTileX, subTileY);
      if (dist < wallWidth) return { isWall: true, wallNormal: angle };
      if (dist > tileSize - wallWidth) return { isWall: true, wallNormal: Math.PI + angle };
      return { isWall: false, wallNormal: undefined };
    }
    case "┐": {
      const dist = distance(0, tileSize, subTileX, subTileY);
      const angle = angleBetween(0, tileSize, subTileX, subTileY);
      if (dist < wallWidth) return { isWall: true, wallNormal: angle };
      if (dist > tileSize - wallWidth) return { isWall: true, wallNormal: Math.PI + angle };
      return { isWall: false, wallNormal: undefined };
    }
    case "┘": {
      const dist = distance(0, 0, subTileX, subTileY);
      const angle = angleBetween(0, 0, subTileX, subTileY);
      if (dist < wallWidth) return { isWall: true, wallNormal: angle };
      if (dist > tileSize - wallWidth) return { isWall: true, wallNormal: Math.PI + angle };
      return { isWall: false, wallNormal: undefined };
    }
    case "└": {
      const dist = distance(tileSize, 0, subTileX, subTileY);
      const angle = angleBetween(tileSize, 0, subTileX, subTileY);
      if (dist < wallWidth) return { isWall: true, wallNormal: angle };
      if (dist > tileSize - wallWidth) return { isWall: true, wallNormal: Math.PI + angle };
      return { isWall: false, wallNormal: undefined };
    }
    default:
      return { isWall: false, wallNormal: undefined };
  }
}
