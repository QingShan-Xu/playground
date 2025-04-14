import type { OutputFile } from "esbuild-wasm";
import { get } from "idb-keyval";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ReactTemplate,
  ReactTemplateDependencies,
  ReactTemplateEntry,
} from "./common/template";
import type { Dependencies, IModule, PlaygroundSetup } from "./type";
import {
  addPackageJSONIfNeeded,
  bundleList,
  createError,
  createPackageJSON,
  customStore,
  generateHtml,
  generateUrl,
  getPkgFromUnpkg,
  getTemplate,
  normalizePath,
  nullthrows,
} from "./utils";

describe("createError", () => {
  it("should create an error message with the correct format", () => {
    const message = "test error";
    const result = createError(message);
    expect(result).toBe("[playground-client]: test error");
  });
});

describe("nullthrows", () => {
  it("should throw an error if the value is null or undefined", () => {
    expect(() => nullthrows(null)).toThrow(
      "[playground-client]: Value is nullish",
    );
    expect(() => nullthrows(undefined)).toThrow(
      "[playground-client]: Value is nullish",
    );
  });

  it("should return the value if it is not null or undefined", () => {
    const value = "test value";
    expect(nullthrows(value)).toBe(value);
  });
});

describe("addPackageJSONIfNeeded", () => {
  let setup: PlaygroundSetup;

  beforeEach(() => {
    setup = {
      name: "test",
      buildOptions: { entry: "/index.js" },
      files: {},
      dependencies: { react: "17.0.2" },
      devDependencies: { typescript: "4.1.3" },
    };
  });

  it("should add a package.json if not present", () => {
    const result = addPackageJSONIfNeeded(setup);
    expect(result["/package.json"]).toBeDefined();
    const packageJson = JSON.parse(result["/package.json"]);
    expect(packageJson.name).toBe("test");
  });

  it("should update package.json if already present", () => {
    setup.files["/package.json"] = JSON.stringify({ name: "test" });
    const result = addPackageJSONIfNeeded(setup);
    const packageJson = JSON.parse(result["/package.json"]);
    expect(packageJson.dependencies.react).toBe("17.0.2");
    expect(packageJson.devDependencies.typescript).toBe("4.1.3");
  });
});

describe("createPackageJSON", () => {
  it("should create a valid package.json string", () => {
    const name = "test";
    const entry = "/index.js";
    const dependencies: Dependencies = { react: "17.0.2" };
    const devDependencies: Dependencies = { typescript: "4.1.3" };
    const result = createPackageJSON(
      name,
      entry,
      dependencies,
      devDependencies,
    );
    const parsedResult = JSON.parse(result);
    expect(parsedResult.name).toBe(name);
    expect(parsedResult.main).toBe(entry);
    expect(parsedResult.dependencies.react).toBe("17.0.2");
    expect(parsedResult.devDependencies.typescript).toBe("4.1.3");
  });
});

describe("normalizePath", () => {
  it("should normalize a string path", () => {
    const path = "some/path";
    const result = normalizePath(path);
    expect(result).toBe("/some/path");
  });

  it("should normalize an array of paths", () => {
    const paths = ["path/one", "path/two"];
    const result = normalizePath(paths);
    expect(result).toEqual(["/path/one", "/path/two"]);
  });

  it("should normalize an object with paths as keys", () => {
    const paths = { "path/one": "content1", "path/two": "content2" };
    const result = normalizePath(paths);
    expect(result).toEqual({
      "/path/one": "content1",
      "/path/two": "content2",
    });
  });
});

describe("getTemplate", () => {
  it('should return the React template when type is "react"', () => {
    const result = getTemplate("react");
    expect(result).toBeDefined();
    expect(result?.files).toEqual(ReactTemplate);
    expect(result?.entry).toBe(ReactTemplateEntry);
    expect(result?.dependices).toEqual(ReactTemplateDependencies);
  });
});

describe("getPkgFromUnpkg", () => {
  it("should fetch and cache package content from unpkg", async () => {
    const uri = "some-package-uri";
    const contents = "package content";
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      text: () => Promise.resolve(contents),
    } as Response);
    const result = await getPkgFromUnpkg(uri);
    expect(result).toBe(contents);
    const cacheRes = await get(uri, customStore);
    expect(cacheRes).toBe(contents);
  });
});

describe("generateUrl", () => {
  beforeEach(() => {
    bundleList.length = 0; // clear bundleList before each test
  });

  it("should generate URL for JS files", () => {
    const item = { path: "file.js", text: 'console.log("test")' } as OutputFile;
    generateUrl(item);
    expect(bundleList).toHaveLength(1);
    expect(bundleList[0].type).toBe("js");
    expect(bundleList[0].url).toMatch(/^blob:/);
  });

  it("should generate URL for CSS files", () => {
    const item = {
      path: "file.css",
      text: "body { color: red; }",
    } as OutputFile;
    generateUrl(item);
    expect(bundleList).toHaveLength(1);
    expect(bundleList[0].type).toBe("css");
    expect(bundleList[0].url).toMatch(/^blob:/);
  });
});

describe("generateHtml", () => {
  it("should generate HTML with JS and CSS modules", () => {
    const html = "<html><body></body></html>";
    const modules: IModule[] = [
      { url: "file.js", type: "js" },
      { url: "file.css", type: "css" },
    ];
    const result = generateHtml(html, modules);
    expect(result).toContain('<script type="module" src="file.js"></script>');
    expect(result).toContain(
      '<link rel="stylesheet" type="text/css" href="file.css">',
    );
  });
});
