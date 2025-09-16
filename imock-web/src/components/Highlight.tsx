import 'highlight.js/styles/atom-one-dark.css'

import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'

hljs.registerLanguage('json', json)
hljs.registerLanguage('javascript', javascript)

export interface HighlightProps {
  lang: string;
  code: string;
  customClass?: string;
  className?: string;
}

export default function Highlight(props: HighlightProps) {
    const { lang, code, customClass, className } = props
    const highlightedCode = hljs.highlight(code, { language: lang }).value
    return (
        <pre
            style={{
                borderRadius: '6px',
                fontSize: '85%',
                lineHeight: 1.45,
                padding: '16px',
            }}
            className={`hljs w-full overflow-scroll whitespace-pre-wrap break-words ${customClass || ''} ${className || ''}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
    )
}
