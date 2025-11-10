import type { Location } from "./history";
import type {
  AgnosticRouteMatch,
  AgnosticRouteObject,
  PathMatch,
  PathPattern,
} from "./utils";

// Re-export types for convenience
export type { PathMatch, PathPattern };

/**
 * A route matcher is responsible for matching URL paths against route patterns
 * and determining which routes should handle a given location.
 *
 * This interface allows for pluggable routing implementations, enabling users to:
 * - Use alternative routing libraries (e.g., Hono routers, path-to-regexp)
 * - Reimplement legacy React Router regex matchers
 * - Write custom matching algorithms for specific requirements
 *
 * @example
 * ```typescript
 * import { setRouteMatcher, type RouteMatcher } from 'react-router';
 *
 * class CustomMatcher implements RouteMatcher {
 *   readonly name = "CustomMatcher";
 *
 *   matchPath(pattern, pathname) {
 *     // Your custom matching logic
 *   }
 *
 *   matchRoutes(routes, location, basename) {
 *     // Your custom route tree matching
 *   }
 * }
 *
 * setRouteMatcher(new CustomMatcher());
 * ```
 *
 * @public
 * @category Router
 */
export interface RouteMatcher {
  /**
   * A unique identifier for this matcher implementation.
   */
  readonly name: string;

  /**
   * Performs pattern matching on a URL pathname and returns information about
   * the match.
   *
   * @param pattern The pattern to match against the URL pathname. This can be a
   * string or a {@link PathPattern} object. If a string is provided, it will be
   * treated as a pattern with `caseSensitive` set to `false` and `end` set to
   * `true`.
   * @param pathname The URL pathname to match against the pattern.
   * @returns A path match object if the pattern matches the pathname,
   * or `null` if it does not match.
   */
  matchPath<ParamKey extends string = string, Path extends string = string>(
    pattern: PathPattern<Path> | Path,
    pathname: string,
  ): PathMatch<ParamKey> | null;

  /**
   * Matches the given routes to a location and returns the match data.
   *
   * @param routes The array of route objects to match against.
   * @param locationArg The location to match against, either a string path or a
   * partial {@link Location} object
   * @param basename Optional base path to strip from the location before matching.
   * Defaults to `/`.
   * @returns An array of matched routes, or `null` if no matches were found.
   */
  matchRoutes<
    RouteObjectType extends AgnosticRouteObject = AgnosticRouteObject,
  >(
    routes: RouteObjectType[],
    locationArg: Partial<Location> | string,
    basename?: string,
  ): AgnosticRouteMatch<string, RouteObjectType>[] | null;
}

