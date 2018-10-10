import { Stream, Listener } from 'xstream'
import xs from 'xstream'
import * as monaco from "monaco-editor"
import 'monaco-editor/esm/vs/basic-languages/lua/lua.contribution';
import {adapt} from '@cycle/run/lib/adapt';

export type Input = Stream<{ container: HTMLElement }>

function luaModel(): monaco.editor.ITextModel {

  let value = [
    'currId = addVertex()',
    'setAttributes(currId, "color", "red")',
    '',
    'while true do',
    '  lastId = currId',
    '  currId = addVertex()',
    '  connectVertices(lastId, currId)',
    '  coroutine.yield()',
    '  setAttributes(lastId, "color", "white")',
    '  setAttributes(currId, "color", "red")',
    '  coroutine.yield()',
    'end'
  ].join("\n")

  let model = monaco.editor.createModel(value, 'lua')

  return model;
}

export function driver(input$: Input) {
  let editor : monaco.editor.IStandaloneCodeEditor | null
  let lastContainer : Element | null
  let model = luaModel();

  input$.subscribe({
    next: ({ container }) => {
      if (!container || !document.body.contains(container)) {
        if(editor) editor.dispose()
        editor = null
        return
      }

      if (!editor || container != lastContainer) {
        lastContainer = container
        editor = monaco.editor.create(container, {
          theme: 'vs-dark',
          model: model,
          minimap: {
            enabled: false
          }
        })
      }
    }
  })


  let output$ = xs.create({
    start: (listener: Listener<string>) => {
      listener.next(model.getLinesContent().join("\n"))

      model.onDidChangeContent(() => listener.next(model.getLinesContent().join("\n")))
    },
    stop: () => {}
  })

  return adapt(output$)
}