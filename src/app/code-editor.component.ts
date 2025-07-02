/**
 * Componente que encapsula el editor de código Monaco
 *
 * Características:
 * - Soporte para HTML, CSS y JavaScript
 * - Two-way binding con [(code)]
 * - Cambio dinámico de tema (claro/oscuro)
 * - Layout automático
 */
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import * as monaco from 'monaco-editor';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  template: `<div class="editor-container" #editorContainer></div>`,
  styles: [`
    .editor-container {
      height: 100%;
      width: 100%;
    }
  `]
})
export class CodeEditorComponent {
  // Configuración del editor
  @Input() language: 'html' | 'css' | 'javascript' = 'html';
  @Input() code: string = '';
  @Input() theme: 'vs' | 'vs-dark' = 'vs';
  @Output() codeChange = new EventEmitter<string>();
  
  @ViewChild('editorContainer', { static: true })
  private editorContainer!: ElementRef<HTMLElement>;
  
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;

  /**
   * Inicializa el editor después de que la vista esté lista
   */
  ngAfterViewInit() {
    this.initializeEditor();
  }

  /**
   * Configura e inicializa la instancia de Monaco Editor
   * - Establece el código inicial
   * - Configura el lenguaje y tema
   * - Habilita layout automático
   * - Registra listener para cambios
   */
  private initializeEditor() {
    // Configuración avanzada del web worker
    (window as any).MonacoEnvironment = {
      getWorker: function(moduleId: string, label: string) {
        const getWorkerModule = (moduleUrl: string, label: string) => {
          return new Worker(new URL(moduleUrl, window.location.href), {
            name: label,
            type: 'module'
          });
        };

        switch (label) {
          case 'typescript':
          case 'javascript':
            return getWorkerModule('./assets/monaco-editor-worker.js', label);
          default:
            return getWorkerModule('./assets/monaco-editor-worker.js', label);
        }
      }
    };

    try {
      this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
        value: this.code,
        language: this.language,
        theme: this.theme,
        automaticLayout: true,
        minimap: { enabled: false }
      });
    } catch (error) {
      console.error('Error initializing Monaco Editor:', error);
    }

    if (this.editor) {
      this.editor.onDidChangeModelContent(() => {
        const newCode = this.editor?.getValue() || '';
        this.code = newCode;
        this.codeChange.emit(newCode);
      });
    }
  }

  /**
   * Limpieza al destruir el componente
   * - Libera recursos del editor
   */
  ngOnDestroy() {
    this.editor?.dispose();
  }

  /**
   * Maneja cambios en las propiedades de entrada
   * - Actualiza tema cuando cambia
   */
  ngOnChanges() {
    if (this.editor) {
      this.editor.updateOptions({ theme: this.theme });
      monaco.editor.setTheme(this.theme);
    }
  }

  /**
   * Actualiza el contenido del editor
   * @param code Nuevo código a establecer
   */
  public setCode(code: string) {
    if (this.editor) {
      this.editor.setValue(code);
      this.code = code;
    }
  }
}