import { useState, useEffect } from 'react';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import Layout from 'Layout';
import { Button } from '@material-ui/core';
import {barabasiAlbert} from 'examples';
import { Visualization } from 'Visualization';
import { luaModel } from 'LuaModel';

interface PageProps {
  code: string;
  setCode: (code: string) => any;
  running: boolean;
  setRunning: (running: boolean) => any;
}

const RunningPage = ({ code, setRunning }: PageProps) => <Layout actions={
  <Button onClick={() => setRunning(false)} color="inherit">Stop</Button>
}>
  <Visualization model={luaModel(code)}/>
</Layout>

const EditorPage = ({ code, setCode, setRunning }: PageProps) => <Layout actions={
  <Button onClick={() => setRunning(true)} color="inherit">Start</Button>
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

const App = () => {
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);

  // Run only once to load the barabasiAlbert
  useEffect(() => {
    barabasiAlbert.load().then((value: string) => setCode(value))
  }, [])

  const pageProps = { code, setCode, running, setRunning };
  return running ? <RunningPage {...pageProps} /> : <EditorPage {...pageProps} />;
}

export default App;
