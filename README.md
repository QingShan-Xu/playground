# Playground

#### Support running js code in the browser

Almost all code playgrounds use server-side packaging, so I wrote a code playground that is packaged locally in the browser.

> [!NOTE]
> This is a testing phase, please do not use it in production environment.  
> You are welcome to use it and submit lssues after `tag:0.1.0`

<img style="width:100%" src="./example.gif" />

## Next

- [ ] To reduce the size of the package:disable tailwindcss
- [ ] Implementation: Vue(currently only react), Customized loading, dependency version determination, local dependency injection (currently using unpkg to obtain dependencies), css injection, open esbuild plugins
- [ ] Support monacoEditor (better ts type hints) and shikut (smaller files, faster speed)
- [ ] Test Coverage
- [ ] Compatibility with next, cjs, etc

## Playground Client

This is a core package that sits on top. It is framework agnostic and is responsible for backend functionality.

## Playground React

React components that give you the power of editable playground that run in the browser.

```shell
npm i @xqcc/playground-react
```

```jsx
import { Playground } from "@xqcc/playground-react";
import "@xqcc/playground-react/style.css";

<Playground template="react" name="your want name" />;
```
