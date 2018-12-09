import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import Layout from 'Layout';
import { Button } from '@material-ui/core';

interface Props {
  code: string;
  setCode: (code: string) => void;
  start: () => void;
}

const EditorPage = ({ code, setCode, start }: Props) => <Layout actions={
  <Button onClick={start} color="inherit">Start</Button>
}>
  <MonacoEditor
    language="lua"
    theme="vs-dark"
    value={code}
    onChange={setCode}
    options={{
      minimap: { enabled: false }
    }}
  />
</Layout>

export default EditorPage;