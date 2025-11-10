---
title: matchRoutes
---

# matchRoutes

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/router/utils.ts
-->

[MODES: framework, data, declarative]

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.matchRoutes.html)

Matches the given routes to a location and returns the match data.

```tsx
import { matchRoutes } from "react-router";

let routes = [{
  path: "/",
  Component: Root,
  children: [{
    path: "dashboard",
    Component: Dashboard,
  }]
}];

matchRoutes(routes, "/dashboard"); // [rootMatch, dashboardMatch]
```

## Signature

```tsx
function matchRoutes<
  RouteObjectType extends AgnosticRouteObject = AgnosticRouteObject,
>(
  routes: RouteObjectType[],
  locationArg: Partial<Location> | string,
  basename = "/",
): AgnosticRouteMatch<string, RouteObjectType>[] | null
```

## Params

### routes

The array of route objects to match against.

### locationArg

The location to match against, either a string path or a partial [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) object

### basename

Optional base path to strip from the location before matching. Defaults to `/`.

## Returns

An array of matched routes, or `null` if no matches were found.

## Custom Matchers

React Router's route matching can be customized using the [`setRouteMatcher`](./setRouteMatcher) function. When a custom matcher is set, `matchRoutes` will delegate to the custom implementation instead of using the default React Router algorithm.

```tsx
import { setRouteMatcher, type RouteMatcher } from 'react-router';

class CustomMatcher implements RouteMatcher {
  readonly name = "CustomMatcher";
  
  matchPath(pattern, pathname) {
    // Your custom path matching logic
  }
  
  matchRoutes(routes, location, basename) {
    // Your custom route tree matching logic
  }
}

setRouteMatcher(new CustomMatcher());
```

This allows you to:
- Use alternative routing libraries (e.g., Hono routers, path-to-regexp)
- Reimplement legacy React Router regex matchers for backwards compatibility
- Implement custom matching algorithms for specific requirements

