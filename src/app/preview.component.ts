/**
 * Componente de vista previa del código
 *
 * Características:
 * - Muestra el resultado del código HTML/CSS/JS
 * - Soporta vistas de móvil, tablet y escritorio
 * - Actualización en tiempo real
 * - Diseños responsivos para cada dispositivo
 */
import { Component, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-preview',
  standalone: true,
  template: `
    <div class="device-controls">
      <button (click)="setDeviceView('desktop')" [class.active]="currentView === 'desktop'">
        <i class="fas fa-desktop"></i> Escritorio
      </button>
      <button (click)="setDeviceView('mobile')" [class.active]="currentView === 'mobile'">
        <i class="fas fa-mobile-alt"></i> Móvil
      </button>
      <button (click)="setDeviceView('tablet')" [class.active]="currentView === 'tablet'">
        <i class="fas fa-tablet-alt"></i> Tablet
      </button>
    </div>
    <div class="device-frame" [class.mobile]="currentView === 'mobile'"
                         [class.tablet]="currentView === 'tablet'"
                         [class.desktop]="currentView === 'desktop'">
      <iframe #previewFrame class="preview-frame"></iframe>
    </div>
  `,
  styles: [`
    /* Estilos consistentes con los botones de pestañas */
    .device-controls {
      display: flex;
      background: var(--tab-bg, #f0f0f0);
      border-bottom: 1px solid var(--tab-border, #ddd);
    }
    
    .device-controls button {
      padding: 10px 20px;
      border: none;
      background: none;
      cursor: pointer;
      font-weight: 500;
      color: var(--tab-text, #333);
      transition: all 0.2s ease;
      position: relative;
    }
    
    .device-controls button:hover {
      background: var(--tab-hover, rgba(0,0,0,0.05));
    }
    
    .device-controls button.active {
      background: var(--tab-active-bg, white);
      color: var(--tab-active-text, #007bff);
      border-bottom: 3px solid var(--tab-active-border, #007bff);
    }
    
    .device-controls button.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--tab-active-border, #007bff);
    }

    :host-context(.dark) {
      --tab-bg: #1a1a1a;
      --tab-border: #333;
      --tab-text: #f0f0f0;
      --tab-hover: rgba(66, 133, 244, 0.1);
      --tab-active-bg: #252525;
      --tab-active-text: #4285f4;
      --tab-active-border: #4285f4;
    }

    :host-context(.light) {
      --tab-bg: #f0f0f0;
      --tab-border: #ddd;
      --tab-text: #333;
      --tab-hover: rgba(0,0,0,0.05);
      --tab-active-bg: white;
      --tab-active-text: #007bff;
      --tab-active-border: #007bff;
    }
    
    
    .device-frame {
      width: 100%;
      height: calc(100% - 45px);
      display: flex;
      justify-content: center;
      align-items: flex-start;
      overflow: auto;
    }

    .device-frame.desktop {
      justify-content: flex-start;
    }
    
    .device-frame.mobile .preview-frame {
      width: 320px;
      height: 568px;
      margin: 1rem auto;
      border: 10px solid #424242;
      border-radius: 30px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
    }
    
    .device-frame.mobile .preview-frame::before {
      content: '';
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 15px;
      background: #111;
      border-radius: 0 0 8px 8px;
      z-index: 10;
    }
    
    .device-frame.tablet .preview-frame {
      width: 600px;
      height: 800px;
      margin: 1rem auto;
      border: 12px solid #424242;
      border-radius: 15px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
    }
    
    .device-frame.tablet .preview-frame::before {
      content: '';
      position: absolute;
      top: 15px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 8px;
      background: #333;
      border-radius: 4px;
    }
    
    .preview-frame {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
      display: block;
    }
    
    .device-frame.desktop .preview-frame {
      width: 100%;
      height: 100%;
      margin: 0;
      border: none;
      border-radius: 0;
      box-shadow: none;
    }
    
    .device-frame.mobile .preview-frame,
    .device-frame.tablet .preview-frame {
      overflow: auto;
    }
  `]
})
export class PreviewComponent implements OnChanges {
  // Código fuente para el preview
  @Input() html: string = '';
  @Input() css: string = '';
  @Input() js: string = '';

  private updateTimeout: any = null;
  private readonly DEBOUNCE_TIME = 500; // 0.5 segundos
  
  currentView: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  /**
   * Inicializa la vista con el modo escritorio por defecto
   */
  ngAfterViewInit() {
    this.setDeviceView('desktop');
  }
  
  @ViewChild('previewFrame', { static: true })
  private previewFrame!: ElementRef<HTMLIFrameElement>;
  
  /**
   * Cambia la vista del dispositivo (mobile/tablet/desktop)
   * @param view Tipo de vista a mostrar
   */
  setDeviceView(view: 'mobile' | 'tablet' | 'desktop'): void {
    this.currentView = view;
  }

  /**
   * Detecta cambios en el código y actualiza el preview
   */
  ngOnChanges() {
    // Cancelar el timeout anterior si existe
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    // Establecer un nuevo timeout
    this.updateTimeout = setTimeout(() => {
      this.updatePreview();
    }, this.DEBOUNCE_TIME);
  }

  /**
   * Genera y actualiza el contenido del preview:
   * - Combina HTML, CSS y JS
   * - Aplica viewport según el dispositivo
   * - Maneja errores de ejecución
   */
  private isValidJsCode(code: string): boolean {
    try {
      new Function(code);
      return true;
    } catch {
      return false;
    }
  }

  private updatePreview() {
    try {
      if (!this.previewFrame) return;
      
      const doc = this.previewFrame.nativeElement.contentDocument;
      if (!doc) return;
      
      doc.open();
      doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="${this.currentView === 'desktop' ? ' initial-scale=1' : 'width=device-width, initial-scale=1'}">
  <style>
    body {
      margin: 0;
      background-color: white;
      color: #333333;
      min-height: ${this.currentView === 'desktop' ? 'auto' : '100vh'};
      overflow: auto;
    }
    ${this.css}
  </style>
</head>
<body>
  ${this.html}
</body>
</html>`);
      
      if (this.js && this.isValidJsCode(this.js)) {
        try {
          const script = doc.createElement('script');
          script.text = this.js;
          doc.body.appendChild(script);
        } catch {}
      }
      
      doc.close();
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  }
}