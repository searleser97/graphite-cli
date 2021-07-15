import { TRouteTree } from "./types";

// Hack so that typescript doesn't widen types for us,
// as it might if we rewrote this code as:
//
// const API_ROUTES: TRouteTree = { ... } as const;
export function asRouteTree<T extends TRouteTree>(routeTree: T): T {
  return routeTree;
}
