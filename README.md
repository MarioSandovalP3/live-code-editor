# Editor de Código en Vivo

Un editor de código integrado con Angular que permite editar HTML, CSS y JavaScript con vista previa en tiempo real.

## Características Principales
- Editor de código basado en Monaco Editor (el mismo que usa VS Code)
- Vista previa en tiempo real
- Soporte para temas claros/oscuros
- Vistas de dispositivo móvil/tablet/escritorio
- Resaltado de sintaxis para HTML, CSS y JavaScript
- Persistencia del código en localStorage

## Requisitos
- Node.js v18+
- Angular CLI v20+
- NPM v9+

## Instalación
1. Clonar el repositorio:
```bash
https://github.com/MarioSandovalP3/live-code-editor.git
```
2. Instalar dependencias:
```bash
cd live-code-editor
npm install
```

## Uso
Iniciar servidor de desarrollo:
```bash
ng serve
```
Abrir en navegador: `http://localhost:4200/`

## Comandos útiles
- Generar nuevo componente:
```bash
ng generate component nombre-componente
```
- Ejecutar pruebas:
```bash
ng test
```
- Construir para producción:
```bash
ng build
```

## Estructura del Proyecto
- `src/app/` - Componentes principales
  - `app.ts` - Componente raíz
  - `code-editor.component.ts` - Editor de código
  - `preview.component.ts` - Vista previa
- `src/styles.scss` - Estilos globales

## Contribución
1. Hacer fork del proyecto
2. Crear rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Hacer push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## Licencia
MIT
