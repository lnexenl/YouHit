/// <reference types="vite/client" />

declare module '@mapbox/polyline' {
  export function encode(
    coordinates: [number, number][],
    precision?: number
  ): string;

  export function decode(
    encoded: string,
    precision?: number
  ): [number, number][];

  export default {
    encode,
    decode,
  };
}