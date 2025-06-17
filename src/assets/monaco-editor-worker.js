self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'json') {
      return './assets/monaco-editor-json.worker.js';
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return './assets/monaco-editor-css.worker.js';
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return './assets/monaco-editor-html.worker.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './assets/monaco-editor-ts.worker.js';
    }
    return './assets/monaco-editor-editor.worker.js';
  }
};