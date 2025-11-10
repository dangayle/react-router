import type { Location } from "./history";
import { parsePath } from "./history";
import type { RouteMatcher } from "./matcher";
import type {
  AgnosticRouteMatch,
  AgnosticRouteObject,
  Params,
  PathMatch,
  PathPattern,
} from "./utils";
import {
  compilePath,
  decodePath,
  flattenRoutes,
  matchRouteBranch,
  rankRouteBranches,
  stripBasename,
} from "./utils";

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type CompiledPathParam = { paramName: string; isOptional?: boolean };

/**
 * The default React Router matcher implementation.
 *
 * This class wraps the existing React Router matching algorithm and exposes it
 * through the {@link RouteMatcher} interface. It can be used explicitly via
 * `setRouteMatcher(new DefaultReactRouterMatcher())` or is used implicitly
 * when no custom matcher is set.
 *
 * @example
 * ```typescript
 * import { DefaultReactRouterMatcher, setRouteMatcher } from 'react-router';
 *
 * // Explicitly use the default matcher
 * setRouteMatcher(new DefaultReactRouterMatcher());
 * ```
 *
 * @public
 * @category Router
 */
export class DefaultReactRouterMatcher implements RouteMatcher {
  readonly name = "DefaultReactRouterMatcher";

  matchPath<ParamKey extends string = string, Path extends string = string>(
    pattern: PathPattern<Path> | Path,
    pathname: string,
  ): PathMatch<ParamKey> | null {
    if (typeof pattern === "string") {
      pattern = { path: pattern, caseSensitive: false, end: true };
    }

    let [matcher, compiledParams] = compilePath(
      pattern.path,
      pattern.caseSensitive,
      pattern.end,
    );

    let match = pathname.match(matcher);
    if (!match) return null;

    let matchedPathname = match[0];
    let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
    let captureGroups = match.slice(1);
    let params: Params = compiledParams.reduce<Mutable<Params>>(
      (memo, { paramName, isOptional }, index) => {
        // We need to compute the pathnameBase here using the raw splat value
        // instead of using params["*"] later because it will be decoded then
        if (paramName === "*") {
          let splatValue = captureGroups[index] || "";
          pathnameBase = matchedPathname
            .slice(0, matchedPathname.length - splatValue.length)
            .replace(/(.)\/+$/, "$1");
        }

        const value = captureGroups[index];
        if (isOptional && !value) {
          memo[paramName] = undefined;
        } else {
          memo[paramName] = (value || "").replace(/%2F/g, "/");
        }
        return memo;
      },
      {},
    );

    return {
      params,
      pathname: matchedPathname,
      pathnameBase,
      pattern,
    };
  }

  matchRoutes<
    RouteObjectType extends AgnosticRouteObject = AgnosticRouteObject,
  >(
    routes: RouteObjectType[],
    locationArg: Partial<Location> | string,
    basename = "/",
  ): AgnosticRouteMatch<string, RouteObjectType>[] | null {
    let location =
      typeof locationArg === "string" ? parsePath(locationArg) : locationArg;

    let pathname = stripBasename(location.pathname || "/", basename);

    if (pathname == null) {
      return null;
    }

    let branches = flattenRoutes(routes);
    rankRouteBranches(branches);

    let matches = null;
    for (let i = 0; matches == null && i < branches.length; ++i) {
      // Incoming pathnames are generally encoded from either window.location
      // or from router.navigate, but we want to match against the unencoded
      // paths in the route definitions.  Memory router locations won't be
      // encoded here but there also shouldn't be anything to decode so this
      // should be a safe operation.  This avoids needing matchRoutes to be
      // history-aware.
      let decoded = decodePath(pathname);
      matches = matchRouteBranch<string, RouteObjectType>(
        branches[i],
        decoded,
        false,
      );
    }

    return matches;
  }
}

/**
 * A singleton instance of the default React Router matcher.
 *
 * @public
 * @category Router
 */
export const defaultMatcher = new DefaultReactRouterMatcher();

