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
      <button (click)="setDeviceView('mobile')">
        <i class="fas fa-mobile-alt"></i> Móvil
      </button>
      <button (click)="setDeviceView('tablet')">
        <i class="fas fa-tablet-alt"></i> Tablet
      </button>
      <button (click)="setDeviceView('desktop')">
        <i class="fas fa-desktop"></i> Escritorio
      </button>
    </div>
    <div class="device-frame" [class.mobile]="currentView === 'mobile'"
                         [class.tablet]="currentView === 'tablet'"
                         [class.desktop]="currentView === 'desktop'">
      <iframe #previewFrame class="preview-frame"></iframe>
    </div>
  `,
  styles: [`
    /* Estáticos solamente - sin lógica dinámica */
    .device-controls {
      display: flex;
      gap: 0.5rem;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
      
    }
    
    .device-controls button {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
    }
    
    .device-controls button:hover {
      background: #eee;
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
    this.updatePreview();
  }

  /**
   * Genera y actualiza el contenido del preview:
   * - Combina HTML, CSS y JS
   * - Aplica viewport según el dispositivo
   * - Maneja errores de ejecución
   */
  private updatePreview() {
    try {
      if (!this.previewFrame) return;
      
      const content = `<!DOCTYPE html>
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
  <script>
    try {
      ${this.js}
    } catch (error) {
      console.error('Execution error:', error);
    }
  </script>
</body>
</html>`;

      this.previewFrame.nativeElement.srcdoc = content;
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  }
}