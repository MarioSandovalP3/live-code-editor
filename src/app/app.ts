/**
 * Componente principal de la aplicación Live Code Editor
 *
 * Funcionalidades:
 * - Editor de código con pestañas para HTML/CSS/JS
 * - Vista previa en tiempo real
 * - Resizable split entre editor y preview
 * - Tema claro/oscuro
 * - Persistencia en localStorage
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import * as monaco from 'monaco-editor';
import { CommonModule } from '@angular/common';
import { Environment } from 'monaco-editor';

// Configuración global para Monaco Editor
declare global {
  interface Window {
    MonacoEnvironment?: Environment;
  }
}
import { CodeEditorComponent } from './code-editor.component';
import { PreviewComponent } from './preview.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, CodeEditorComponent, PreviewComponent],
  template: `
    <div class="app-container">
      <header>
        <h1>Live Code Editor</h1>
        <div class="actions">
          <button (click)="toggleTheme()" class="theme-toggle">
            {{isDarkTheme ? '☀️ Light' : '🌙 Dark'}} Mode
          </button>
          <button (click)="resetCode()">Reset Code</button>
        </div>
      </header>
      <div class="editor-container">
        <div class="code-tabs">
          <div class="tab-buttons">
            <button
              *ngFor="let tab of tabs"
              [class.active]="activeTab === tab.id"
              (click)="activeTab = tab.id"
            >
              {{tab.label}}
            </button>
          </div>
          <div class="code-editor-container">
            <app-code-editor
              *ngIf="activeTab === 'html'"
              #htmlEditor
              language="html"
              [(code)]="htmlCode"
              [theme]="isDarkTheme ? 'vs-dark' : 'vs'"
            ></app-code-editor>
            <app-code-editor
              *ngIf="activeTab === 'css'"
              #cssEditor
              language="css"
              [(code)]="cssCode"
              [theme]="isDarkTheme ? 'vs-dark' : 'vs'"
            ></app-code-editor>
            <app-code-editor
              *ngIf="activeTab === 'js'"
              #jsEditor
              language="javascript"
              [(code)]="jsCode"
              [theme]="isDarkTheme ? 'vs-dark' : 'vs'"
            ></app-code-editor>
          </div>
        </div>
        <div class="resizer"
             (mousedown)="startResize($event)"
             (mouseenter)="setResizeCursor(true)"
             (mouseleave)="setResizeCursor(false)">
        </div>
        <div class="preview">
          <app-preview
            [html]="htmlCode"
            [css]="cssCode"
            [js]="jsCode"
          ></app-preview>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    header {
      padding: 5px;
      background: #333;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .actions {
      display: flex;
      gap: 0.5rem;
    }
    .editor-container {
      display: flex;
      flex: 1;
      position: relative;
    }
    /* Estilos del resizer movidos a styles.scss */
    .code-tabs {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      max-height: calc(100vh - 60px);
    }
    .tab-buttons {
      display: flex;
      background: var(--tab-bg, #f0f0f0);
      border-bottom: 1px solid var(--tab-border, #ddd);
    }
    .tab-buttons button {
      padding: 10px 20px;
      border: none;
      background: none;
      cursor: pointer;
      font-weight: 500;
      color: var(--tab-text, #333);
      transition: all 0.2s ease;
      position: relative;
    }
    .tab-buttons button:hover {
      background: var(--tab-hover, rgba(0,0,0,0.05));
    }
    .tab-buttons button.active {
      background: var(--tab-active-bg, white);
      color: var(--tab-active-text, #007bff);
      border-bottom: 3px solid var(--tab-active-border, #007bff);
    }
    .tab-buttons button.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--tab-active-border, #007bff);
    }
    .theme-toggle {
      padding: 8px 16px;
      border-radius: 20px;
      border: none;
      background: #4285f4;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    .theme-toggle:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }

    .dark-theme {
      --tab-bg: #1a1a1a;
      --tab-border: #333;
      --tab-text: #f0f0f0;
      --tab-hover: rgba(66, 133, 244, 0.1);
      --tab-active-bg: #252525;
      --tab-active-text: #4285f4;
      --tab-active-border: #4285f4;
      background: #121212;
    }

    .dark-theme .theme-toggle {
      background: #121212;
      color: #4285f4;
      border: 2px solid #4285f4;
    }
    .code-editor-container {
      flex: 1;
      overflow: hidden;
    }
    
    .preview {
      flex: 1;
      min-width: 200px;
      overflow: auto;
      max-height: calc(100vh - 60px);
    }
    
    app-code-editor {
      flex: 1;
      min-height: 200px;
      overflow: hidden;
    }
  `],
})
export class App implements OnInit {
  // Referencias a los editores
  @ViewChild('htmlEditor') htmlEditor?: CodeEditorComponent;
  @ViewChild('cssEditor') cssEditor?: CodeEditorComponent;
  @ViewChild('jsEditor') jsEditor?: CodeEditorComponent;

  // Variables para el resizer
  private isResizing = false;
  private startX = 0;
  private startWidth = 0;

  startResize(e: MouseEvent) {
    if (e.button !== 0) return; // Solo botón izquierdo
    this.isResizing = true;
    this.startX = e.clientX;
    this.startWidth = document.querySelector('.code-tabs')?.clientWidth || 0;
    document.querySelector('.editor-container')?.classList.add('resizing');
    
    // Guardar referencias a los listeners para poder removerlos
    this.resizeFn = this.resize.bind(this);
    this.stopResizeFn = this.stopResize.bind(this);
    
    document.addEventListener('mousemove', this.resizeFn);
    document.addEventListener('mouseup', this.stopResizeFn, { once: true });
    document.addEventListener('mouseleave', this.stopResizeFn);
    
    // Cambiar cursor solo durante resize activo
    this.setResizeCursor(true);
    e.preventDefault();
    e.stopPropagation();
  }

  resize(e: MouseEvent) {
  if (!this.isResizing || e.buttons !== 1) {
    this.stopResize(); // Detener si ya no hay click presionado
    return;
  }

  const dx = e.clientX - this.startX;
  const newWidth = this.startWidth + dx;
  const editorContainer = document.querySelector('.editor-container') as HTMLElement;
  const codeTabs = document.querySelector('.code-tabs') as HTMLElement;

  if (editorContainer && codeTabs) {
    const minWidth = 300;
    const maxWidth = editorContainer.clientWidth - 300;
    codeTabs.style.width = `${Math.min(Math.max(newWidth, minWidth), maxWidth)}px`;
    codeTabs.style.flex = '0 0 auto';
  }
}

  private resizeFn?: (e: MouseEvent) => void;
  private stopResizeFn?: () => void;

  setResizeCursor(active: boolean) {
    const editorContainer = document.querySelector('.editor-container') as HTMLElement;
    if (editorContainer) {
      editorContainer.style.cursor = this.isResizing ? 'col-resize' : (active ? 'ew-resize' : '');
    }
  }

  stopResize() {
    if (!this.isResizing) return;
    this.isResizing = false;
    document.querySelector('.editor-container')?.classList.remove('resizing');
    
    // Remover todos los listeners
    if (this.resizeFn) {
      document.removeEventListener('mousemove', this.resizeFn);
    }
    if (this.stopResizeFn) {
      document.removeEventListener('mouseup', this.stopResizeFn);
      document.removeEventListener('mouseleave', this.stopResizeFn);
    }
    
    // Restaurar cursor
    this.setResizeCursor(false);
  }
  private readonly STORAGE_KEY = 'live-code-editor-content';
  
  /**
   * Inicialización del componente:
   * - Configura Monaco Editor
   * - Carga código guardado del localStorage
   */
  ngOnInit() {
    window.MonacoEnvironment = {
      getWorkerUrl: function(moduleId: string, label: string) {
        return './assets/monaco-editor-worker.js';
      }
    };
    this.loadFromStorage();
  }
  
  // Configuración de la aplicación
  protected title = 'live-code-editor';
  isDarkTheme = false;
  activeTab = 'html';
  tabs = [
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
    { id: 'js', label: 'JavaScript' }
  ];

  private _htmlCode = '<h1>Hello World!</h1>';
  private _cssCode = 'h1 { color: blue; }';
  private _jsCode = 'console.log("Hello from JS!");';

  get htmlCode(): string { return this._htmlCode; }
  set htmlCode(value: string) {
    this._htmlCode = value;
    this.saveToStorage();
  }

  get cssCode(): string { return this._cssCode; }
  set cssCode(value: string) {
    this._cssCode = value;
    this.saveToStorage();
  }

  get jsCode(): string { return this._jsCode; }
  set jsCode(value: string) {
    this._jsCode = value;
    this.saveToStorage();
  }

  /**
   * Guarda el código actual y preferencias en localStorage
   */
  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      html: this.htmlCode,
      css: this.cssCode,
      js: this.jsCode,
      theme: this.isDarkTheme
    }));
  }

  /**
   * Carga código y preferencias desde localStorage
   */
  private loadFromStorage() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const { html, css, js, theme } = JSON.parse(saved);
        this.htmlCode = html || this.htmlCode;
        this.cssCode = css || this.cssCode;
        this.jsCode = js || this.jsCode;
        this.isDarkTheme = theme ?? this.isDarkTheme;
        document.body.classList.toggle('dark-theme', this.isDarkTheme);
        document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
      } catch (e) {
        console.error('Failed to parse saved code', e);
      }
    }
  }

  /**
   * Restablece el código a los valores por defecto
   */
  resetCode() {
    const defaultHtml = '<h1>Hello World!</h1>';
    const defaultCss = 'h1 { color: blue; }';
    const defaultJs = 'console.log("Hello from JS!");';

    // Actualizar los editores usando el método público
    this.htmlEditor?.setCode(defaultHtml);
    this.cssEditor?.setCode(defaultCss);
    this.jsEditor?.setCode(defaultJs);

    // Actualizar las variables internas
    this.htmlCode = defaultHtml;
    this.cssCode = defaultCss;
    this.jsCode = defaultJs;
    this.saveToStorage();
  }

  /**
   * Alterna entre tema claro y oscuro
   * Actualiza:
   * - Clases CSS
   * - Atributos de tema
   * - Configuración de Monaco Editor
   */
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
    document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
    this.saveToStorage();
    
    // Forzar actualización de todos los editores
    setTimeout(() => {
      const theme = this.isDarkTheme ? 'vs-dark' : 'vs';
      monaco.editor.setTheme(theme);
    }, 100);
  }
}
