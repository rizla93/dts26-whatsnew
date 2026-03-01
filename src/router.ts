import { Router, type Route } from "@vaadin/router";

import { DEMOS } from "./demos/manifest.ts";

import "./pages/landing-page.ts";

const outlet = document.getElementById("app");
if (!outlet) {
  throw new Error("Missing #app outlet");
}

const routes: Route[] = [
  {
    path: "/",
    component: "landing-page",
  },
  ...DEMOS.map<Route>((demo) => ({
    path: demo.path,
    async action(_context, commands) {
      await demo.load();
      return commands.component(demo.tagName);
    },
  })),
];

const router = new Router(outlet);
router.setRoutes(routes);
