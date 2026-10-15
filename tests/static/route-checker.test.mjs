import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

test("Static Suite: Internal Route and Link Integrity", async (t) => {
  // Known routes based on app directory structure
  const knownStaticRoutes = new Set([
    "/",
    "/account",
    "/activity",
    "/administration",
    "/alignment",
    "/budget",
    "/ceremony",
    "/guests",
    "/invitation",
    "/post-wedding",
    "/registry",
    "/rundown",
    "/savings",
    "/seserahan",
    "/timeline",
    "/vendors",
  ]);

  const dynamicRoutePrefixes = [
    "/invitation/",
    "/registry/",
    "/api/",
  ];

  function isRouteValid(route) {
    if (!route || !route.startsWith("/")) return true; // external or anchor-only
    const cleanRoute = route.split("?")[0].split("#")[0];
    if (cleanRoute === "") return true;
    if (knownStaticRoutes.has(cleanRoute)) return true;
    for (const prefix of dynamicRoutePrefixes) {
      if (cleanRoute.startsWith(prefix)) return true;
    }
    return false;
  }

  function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        getFiles(fullPath, fileList);
      } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  const srcFiles = getFiles(path.resolve(process.cwd(), "src"));
  const brokenLinks = [];

  const linkRegex = /href=["'](\/[^"']*)["']/g;
  const routerPushRegex = /router\.push\(["'](\/[^"']*)["']\)/g;

  for (const filePath of srcFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const route = match[1];
      if (!isRouteValid(route)) {
        brokenLinks.push({ file: path.relative(process.cwd(), filePath), route });
      }
    }

    while ((match = routerPushRegex.exec(content)) !== null) {
      const route = match[1];
      if (!isRouteValid(route)) {
        brokenLinks.push({ file: path.relative(process.cwd(), filePath), route });
      }
    }
  }

  await t.test("All internal links and router.push destinations resolve to valid application routes", () => {
    assert.deepEqual(brokenLinks, [], `Found broken internal routes: ${JSON.stringify(brokenLinks, null, 2)}`);
  });
});
