import { fs } from "@zenfs/core";
import type { Loader, Plugin } from "esbuild-wasm";
import pathBrowser from "path-browserify";

import { getPkgFromUnpkg } from "./utils";

export const unpkgPlugin: Plugin = {
  name: "unpkg",
  setup(build) {
    // 匹配入口文件依赖项
    build.onResolve({ filter: /^[^.\/].*$/, namespace: "files" }, (args) => {
      return {
        namespace: "node_modules",
        path: args.path,
      };
    });

    // 匹配依赖项的依赖项
    build.onResolve(
      { filter: /^[^.\/].*$/, namespace: "node_modules" },
      (args) => {
        return {
          path: args.path,
          namespace: "node_modules",
        };
      },
    );

    // 匹配依赖项文件
    build.onResolve({ filter: /.*/, namespace: "node_modules" }, (args) => {
      return {
        path: pathBrowser.join(args.resolveDir, args.path),
        namespace: "node_modules",
        pluginData: args.pluginData,
      };
    });

    // 匹配文件
    build.onResolve({ filter: /.*/, namespace: "files" }, async (args) => {
      const currentPath = pathBrowser.join(args.resolveDir, args.path);
      if (pathBrowser.extname(args.path)) {
        return {
          path: currentPath,
          namespace: "files",
        };
      }

      const ext = build.initialOptions.resolveExtensions?.find(async (ext) => {
        const isHas = fs.existsSync(
          pathBrowser.join(args.resolveDir, args.path + ext),
        );
        return isHas;
      });

      return {
        path: currentPath + ext,
        namespace: "files",
      };
    });

    // 入口文件
    build.onResolve({ filter: /.*/ }, (args) => {
      return {
        path: pathBrowser.join(args.resolveDir, args.path),
        namespace: "files",
      };
    });

    // // 依赖
    build.onLoad({ filter: /.*/, namespace: "node_modules" }, async (args) => {
      // todo wait zenfs/dom support zenfs/port
      // const fsPath = pathBrowser.join("/", "node_modules", args.path.replace("/", "__slash"))
      // const isHasDir = fs.existsSync(pathBrowser.dirname(fsPath))
      // if (!isHasDir) {
      //   fs.mkdirSync(pathBrowser.dirname(fsPath), { recursive: true })
      // }
      // const isHasFile = fs.existsSync(fsPath)
      // if (!isHasFile) {
      // const contents = await getPkgFromUnpkg(args.path)
      // fs.writeFileSync(fsPath, contents)
      // }
      // const contents = fs.readFileSync(fsPath, "utf8")

      const contents = await getPkgFromUnpkg(args.path);
      return {
        loader: (pathBrowser.extname(args.path).slice(1) as Loader) || "js",
        contents,
        pluginData: args.pluginData,
        resolveDir: args.path,
      };
    });

    // 文件
    build.onLoad({ filter: /.*/ }, async (args) => {
      const contents = fs.readFileSync(args.path, "utf8");

      return {
        loader: (pathBrowser.extname(args.path).slice(1) as Loader) || "js",
        contents,
        resolveDir: pathBrowser.dirname(args.path),
      };
    });
  },
};
