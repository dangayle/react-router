---
title: matchPath
---

# matchPath

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

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.matchPath.html)

Performs pattern matching on a URL pathname and returns information about
the match.

## Signature

```tsx
function matchPath<ParamKey extends ParamParseKey<Path>, Path extends string>(
  pattern: PathPattern<Path> | Path,
  pathname: string,
): PathMatch<ParamKey> | null
```

## Params

### pattern

The pattern to match against the URL pathname. This can be a string or a [`PathPattern`](https://api.reactrouter.com/v7/interfaces/react_router.PathPattern.html) object. If a string is provided, it will be
treated as a pattern with `caseSensitive` set to `false` and `end` set to
`true`.

### pathname

The URL pathname to match against the pattern.

## Returns

A path match object if the pattern matches the pathname,
or `null` if it does not match.

## Custom Matchers

React Router's route matching can be customized using the [`setRouteMatcher`](./setRouteMatcher) function. When a custom matcher is set, `matchPath` will delegate to the custom implementation instead of using the default React Router algorithm.

```tsx
import { setRouteMatcher, type RouteMatcher } from 'react-router';

class CustomMatcher implements RouteMatcher {
  readonly name = "CustomMatcher";
  
  matchPath(pattern, pathname) {
    // Your custom matching logic
  }
  
  matchRoutes(routes, location, basename) {
    // Your custom route tree matching
  }
}

setRouteMatcher(new CustomMatcher());
```

This allows you to:
- Use alternative routing libraries (e.g., Hono routers, path-to-regexp)
- Reimplement legacy React Router regex matchers
- Implement custom matching algorithms for specific requirements

