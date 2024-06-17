import React, { forwardRef, useEffect } from "react";
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { javascript } from '@codemirror/lang-javascript';

const CodeMirrorComponent = forwardRef((props, ref) => {
  useEffect(() => {
    const editor = ref.current;
    if (editor) {
      editor.setOption("fullScreen", props.fullScreen); // Set fullscreen mode
    }
  }, [props.fullScreen, ref]);

  return (
    <CodeMirror
      value={props.value}
      onChange={(value, viewUpdate) => {
        props.onChange(value, viewUpdate); // Update state with code
      }}
      height="200px"
      width='500px'
      theme={vscodeDark}
      extensions={[javascript({ jsx: true })]}
      ref={ref}
    />
  );
});

export default CodeMirrorComponent;
