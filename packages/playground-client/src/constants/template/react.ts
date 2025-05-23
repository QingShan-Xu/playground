import type { Dependencies } from "../../types";

export const ReactTemplate = {
  "/src/App.tsx": `import React from 'react';
    export default function App() {
      return (
        <div className='App'>
          <h1>Hello React TypeScript.</h1>
          <h2>Start editing to see some magic happen!</h2>
        </div>
    )}
    // Log to console
    console.log('Hello console')
    `,
  "/src/index.tsx": `
  import React, { StrictMode } from "react";
  import * as ReactDOMClient from "react-dom/client";
  import "./style.css"

  import App from "./App";

  const rootElement = document.getElementById("root");
  const root = ReactDOMClient.createRoot(rootElement);

  root.render(
  <StrictMode>
    <App />
  </StrictMode>
  );`,
  "/src/style.css": `body {
  overflow: auto;
  background: transparent; /* Make it white if you need */
  padding: 0 24px;
  margin: 0;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .App {
  color: #72a24d;
  }

  #root {
    height: 100%;
  }
  `,
  "/index.html": `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
  `,
  "/package.json": `
  {
  "dependencies": {
    "react": "18.0.0",
    "react-dom": "18.0.0"
  }
  }`,
};

export const ReactTemplateEntry = "/src/index.tsx";
export const ReactTemplateDependencies: Dependencies = {
  react: "18.0.0",
  "react-dom": "18.0.0",
};
