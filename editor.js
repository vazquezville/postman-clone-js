import { EditorState, basicSetup } from "@codemirror/basic-setup";
import { defaultTabBinding } from "@codemirror/commands";
import { json } from "@codemirror/lang-json";
import { EditorView, keymap } from "@codemirror/view";
import { oneDarkTheme } from "@codemirror/theme-one-dark";

//Create two view editors for the json format, one for the request and one for the response
export default function editors() {
  //Select the html fields
  const jsonRequestBody = document.querySelector("[data-jsonRequestBody]");
  const jsonResponseBody = document.querySelector("[data-jsonResponseBody]");

  //Extensions for the editor
  const basicExtensions = [
    basicSetup,
    keymap.of([defaultTabBinding]),
    json(),
    EditorState.tabSize.of(4),
    oneDarkTheme,
  ];

  //Request editor
  const requestEditor = new EditorView({
    state: EditorState.create({
      doc: "{\n\t\n}",
      extensions: basicExtensions,
    }),
    parent: jsonRequestBody,
  });

  //Response editor, read-only
  const responseEditor = new EditorView({
    state: EditorState.create({
      doc: "{}",
      extensions: [...basicExtensions, EditorView.editable.of(false)],
    }),
    parent: jsonResponseBody,
  });

  function updateResponseEditor(value) {
    responseEditor.dispatch({
      changes: {
        from: 0,
        to: responseEditor.state.doc.length,
        insert: JSON.stringify(value, null, 2),
      },
    });
  }

  return { requestEditor, updateResponseEditor };
}
