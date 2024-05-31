import { CodeEditor } from "./CodeEditor"

export default {
  title: 'CodeEditor',
  component: CodeEditor,
  parameters: {
    // 用于使组件在画布中居中的可选参数。更多信息：https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
}

export const example = {
  args: {
    width: "300px",
    height: "300px",
    editorOptions: {},
    value: `// posts will be populated at build time by getStaticProps()
    function Blog({ posts }) {
      return (
        <ul>
          {posts.map((post) => (
              <li>{post.title}</li>
          ))}
        </ul> 
      )
    }
    
    // This function gets called at build time on server-side.
    export async function getStaticProps() {
      const res = await fetch('https://.../posts')
      const posts = await res.json()
    
      return {
        props: {
          posts
        }
      }
    }
    
    export default Blog`
  },

}