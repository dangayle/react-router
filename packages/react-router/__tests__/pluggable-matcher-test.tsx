import * as React from "react";
import type { RouteObject } from "react-router";
import {
  matchPath,
  matchRoutes,
  setRouteMatcher,
  getRouteMatcher,
  DefaultReactRouterMatcher,
  type RouteMatcher,
  type PathPattern,
  type PathMatch,
  type AgnosticRouteMatch,
  type AgnosticRouteObject,
} from "react-router";
import type { Location } from "react-router";

describe("Pluggable Matcher", () => {
  afterEach(() => {
    // Reset custom matcher after each test
    setRouteMatcher(null);
  });

  describe("setRouteMatcher and getRouteMatcher", () => {
    it("sets and gets a custom matcher", () => {
      class TestMatcher implements RouteMatcher {
        readonly name = "TestMatcher";
        matchPath() {
          return null;
        }
        matchRoutes() {
          return null;
        }
      }

      let matcher = new TestMatcher();
      setRouteMatcher(matcher);
      expect(getRouteMatcher()).toBe(matcher);
    });

    it("resets to default with null", () => {
      class TestMatcher implements RouteMatcher {
        readonly name = "TestMatcher";
        matchPath() {
          return null;
        }
        matchRoutes() {
          return null;
        }
      }

      setRouteMatcher(new TestMatcher());
      expect(getRouteMatcher()).not.toBeNull();
      setRouteMatcher(null);
      expect(getRouteMatcher()).toBeNull();
    });

    it("returns null when no custom matcher is set", () => {
      expect(getRouteMatcher()).toBeNull();
    });
  });

  describe("Default behavior without custom matcher", () => {
    it("matchPath works as before", () => {
      expect(matchPath("/users/:id", "/users/123")).toMatchObject({
        pathname: "/users/123",
        params: { id: "123" },
      });
    });

    it("matchRoutes works as before", () => {
      let routes: RouteObject[] = [
        {
          path: "/",
          children: [
            {
              path: "users/:id",
            },
          ],
        },
      ];

      let matches = matchRoutes(routes, "/users/123");
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(2);
      expect(matches![1].params).toEqual({ id: "123" });
    });

    it("handles splat routes", () => {
      expect(matchPath("/files/*", "/files/one/two/three")).toMatchObject({
        pathname: "/files/one/two/three",
        params: { "*": "one/two/three" },
      });
    });

    it("handles root path", () => {
      let routes: RouteObject[] = [{ path: "/" }];
      let matches = matchRoutes(routes, "/");
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(1);
    });
  });

  describe("Custom matcher integration", () => {
    it("uses custom matcher for matchPath", () => {
      class CustomMatcher implements RouteMatcher {
        readonly name = "CustomMatcher";

        matchPath<ParamKey extends string = string, Path extends string = string>(
          pattern: PathPattern<Path> | Path,
          pathname: string,
        ): PathMatch<ParamKey> | null {
          // Custom logic: only match if pathname starts with /custom
          if (!pathname.startsWith("/custom")) {
            return null;
          }
          return {
            params: {} as any,
            pathname,
            pathnameBase: pathname,
            pattern: typeof pattern === "string" ? { path: pattern } : pattern,
          };
        }

        matchRoutes() {
          return null;
        }
      }

      setRouteMatcher(new CustomMatcher());

      // Should match with custom logic
      expect(matchPath("/users", "/custom/users")).not.toBeNull();

      // Should not match without /custom prefix
      expect(matchPath("/users", "/users")).toBeNull();
    });

    it("uses custom matcher for matchRoutes", () => {
      class CustomMatcher implements RouteMatcher {
        readonly name = "CustomMatcher";

        matchPath() {
          return null;
        }

        matchRoutes<
          RouteObjectType extends AgnosticRouteObject = AgnosticRouteObject,
        >(
          routes: RouteObjectType[],
          locationArg: Partial<Location> | string,
          basename?: string,
        ): AgnosticRouteMatch<string, RouteObjectType>[] | null {
          // Custom logic: always return first route with custom params
          if (routes.length === 0) return null;
          return [
            {
              params: { custom: "value" },
              pathname: "/custom",
              pathnameBase: "/custom",
              route: routes[0],
            },
          ];
        }
      }

      setRouteMatcher(new CustomMatcher());

      let routes: RouteObject[] = [{ path: "/" }];
      let matches = matchRoutes(routes, "/any-path");

      expect(matches).not.toBeNull();
      expect(matches![0].params).toEqual({ custom: "value" });
    });

    it("custom matcher receives correct arguments", () => {
      let matchPathCalls: any[] = [];
      let matchRoutesCalls: any[] = [];

      class SpyMatcher implements RouteMatcher {
        readonly name = "SpyMatcher";

        matchPath(
          pattern: PathPattern<string> | string,
          pathname: string,
        ): PathMatch | null {
          matchPathCalls.push({ pattern, pathname });
          return null;
        }

        matchRoutes(
          routes: AgnosticRouteObject[],
          locationArg: Partial<Location> | string,
          basename?: string,
        ): AgnosticRouteMatch[] | null {
          matchRoutesCalls.push({ routes, locationArg, basename });
          return null;
        }
      }

      setRouteMatcher(new SpyMatcher());

      matchPath("/users/:id", "/users/123");
      expect(matchPathCalls).toHaveLength(1);
      expect(matchPathCalls[0]).toMatchObject({
        pattern: "/users/:id",
        pathname: "/users/123",
      });

      let routes: RouteObject[] = [{ path: "/" }];
      matchRoutes(routes, "/test", "/base");
      expect(matchRoutesCalls).toHaveLength(1);
      expect(matchRoutesCalls[0]).toMatchObject({
        routes,
        locationArg: "/test",
        basename: "/base",
      });
    });
  });

  describe("DefaultReactRouterMatcher class", () => {
    it("works when explicitly set", () => {
      setRouteMatcher(new DefaultReactRouterMatcher());

      expect(matchPath("/users/:id", "/users/123")).toMatchObject({
        pathname: "/users/123",
        params: { id: "123" },
      });

      let routes: RouteObject[] = [
        {
          path: "/users/:id",
        },
      ];

      let matches = matchRoutes(routes, "/users/456");
      expect(matches).not.toBeNull();
      expect(matches![0].params).toEqual({ id: "456" });
    });

    it("has correct name", () => {
      let matcher = new DefaultReactRouterMatcher();
      expect(matcher.name).toBe("DefaultReactRouterMatcher");
    });

    it("handles dynamic segments", () => {
      let matcher = new DefaultReactRouterMatcher();
      let match = matcher.matchPath("/users/:id", "/users/123");

      expect(match).toMatchObject({
        pathname: "/users/123",
        params: { id: "123" },
      });
    });

    it("handles splat routes", () => {
      let matcher = new DefaultReactRouterMatcher();
      let match = matcher.matchPath("/files/*", "/files/a/b/c");

      expect(match).toMatchObject({
        pathname: "/files/a/b/c",
        params: { "*": "a/b/c" },
      });
    });

    it("handles nested routes", () => {
      let matcher = new DefaultReactRouterMatcher();
      let routes: RouteObject[] = [
        {
          path: "/",
          children: [
            {
              path: "users",
              children: [
                {
                  path: ":id",
                },
              ],
            },
          ],
        },
      ];

      let matches = matcher.matchRoutes(routes, "/users/123");
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(3);
      expect(matches![2].params).toEqual({ id: "123" });
    });

    it("handles basename correctly", () => {
      let matcher = new DefaultReactRouterMatcher();
      let routes: RouteObject[] = [
        {
          path: "/users/:id",
        },
      ];

      let matches = matcher.matchRoutes(routes, "/app/users/123", "/app");
      expect(matches).not.toBeNull();
      expect(matches![0].params).toEqual({ id: "123" });
    });

    it("returns null for non-matching paths", () => {
      let matcher = new DefaultReactRouterMatcher();
      expect(matcher.matchPath("/users", "/posts")).toBeNull();
      expect(matcher.matchRoutes([{ path: "/users" }], "/posts")).toBeNull();
    });
  });

  describe("Backwards compatibility", () => {
    it("existing code works without changes", () => {
      // No custom matcher set - should use default behavior
      let routes: RouteObject[] = [
        {
          path: "/",
          children: [
            {
              path: "about",
            },
            {
              path: "users/:id",
            },
          ],
        },
      ];

      let matches = matchRoutes(routes, "/users/789");
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(2);
      expect(matches![1].params).toEqual({ id: "789" });
      expect(matches![1].pathname).toBe("/users/789");
    });

    it("handles complex nested routes", () => {
      let routes: RouteObject[] = [
        {
          path: "/",
          children: [
            {
              path: "dashboard",
              children: [
                {
                  path: "settings",
                  children: [
                    {
                      path: ":section",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      let matches = matchRoutes(routes, "/dashboard/settings/profile");
      expect(matches).not.toBeNull();
      expect(matches).toHaveLength(4);
      expect(matches![3].params).toEqual({ section: "profile" });
    });
  });
});

