import { Editor, Monaco, OnChange, useMonaco } from '@monaco-editor/react'
import { shikiToMonaco, } from '@shikijs/monaco'
import { editor } from "monaco-editor"
import React, { useCallback, useEffect } from 'react'
import { BundledLanguage, BundledTheme, getHighlighter } from "shiki"

type ICodeEditorProps = {
  style?: React.CSSProperties
  /**
   * @defult [ "one-dark-pro" ]
   */
  themes?: BundledTheme[]
  /**
   * @defult [ 'javascript', 'typescript', "jsx", "tsx" ,"vue"]
   */
  langs?: BundledLanguage[]
  monacoEditorOptions?: editor.IStandaloneEditorConstructionOptions
  /**
   * @defult tsx
   */
  defaultLanguage?: BundledLanguage
  language?: string
  value?: string
  path?: string
  onChange?: (v: string, path: string) => void
}

export const CodeEditor: React.FC<ICodeEditorProps> = props => {
  const monaco = useMonaco()

  const {
    style = { width: 240, height: 240 },
    themes = ["one-dark-pro"],
    langs = ['javascript', 'typescript', "jsx", "tsx", "vue"],
    monacoEditorOptions,
    language,
    value,
    path,
    onChange
  } = props

  const handleBeforeMount = useCallback(async (monaco: Monaco) => {
    const highlighter = await getHighlighter({ themes, langs })
    handleRegisterLanguage(langs, monaco)
    shikiToMonaco(highlighter, monaco)

    const tsConfig = {
      typeRoots: ["node_modules/@types"],
      baseUrl: ".",
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: monaco.languages.typescript.ModuleKind.ESNext,
      skipLibCheck: true,
      resolveJsonModule: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowImportingTsExtensions: true,
      isolatedModules: true,
      noEmit: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    }
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(tsConfig)
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(tsConfig)
  }, [])

  const handleChange: OnChange = (v) => {
    if (!v || !path) return
    onChange?.(v, path)
  }

  const handleRegisterLanguage = useCallback((langs: string[], monaco: Monaco) => {
    const monacoLanguages = monaco.languages.getLanguages().map(({ id }) => id)
    langs.forEach(langue => {
      if (!monacoLanguages.includes(langue)) {
        monaco.languages.register({ id: langue })
      }
    })
  }, [])

  useEffect(() => {
    if (!monaco || !language) return
    handleRegisterLanguage([language], monaco)
  }, [
    language
  ])

  return (
    <div style={style} className="__playground_editor border-l border-b">
      <Editor
        onChange={handleChange}
        theme={themes[0]}
        defaultLanguage="tsx"
        width={"100%"}
        height={"100%"}
        beforeMount={handleBeforeMount}
        options={{
          autoIndent: "keep",
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
          lineNumbersMinChars: 3,
          folding: false,
          ...monacoEditorOptions
        }}
        value={value}
        path={path}
        language={language} />
    </div>
  )
}