import { useState, useEffect } from 'react';
import * as React from 'react';
import {barabasiAlbert} from 'examples';
import EditorPage from 'pages/EditorPage';
import VisualizationPage from 'pages/VisualizationPage';

const Router = () => {
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);

  // Run only once to load the barabasiAlbert
  useEffect(() => {
    barabasiAlbert.load().then((value: string) => setCode(value))
  }, [])

  if(running) {
    return <VisualizationPage
      code={code}
      stop={() => setRunning(false)}
    />
  } else {
    return <EditorPage
      code={code}
      setCode={setCode}
      start={() => setRunning(true)}
    />
  }
}

export default Router;
