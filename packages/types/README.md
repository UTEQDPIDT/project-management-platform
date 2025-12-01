# Types Package

Este es un paquete interno donde se centralizan los `enums`, `intrafece` y `type` para el resto de las aplicaciones. A continuación se detallan los pasos a seguir para agregar dichos tipados correctamente y generar el `/dist` para poder importarlos a cualquier aplicación dentro del repo.

La estructura del paquete es la siguiente
```bash
types/
├── src/
│   ├── enums/            # Locación de los enums
│       ├── example.enum.ts     
├── dist/                 # Distro donde se exponen los archivos al resto del repo
├── package.json
└── README.md             # Este archivo
```

### 1. Crea el archivo en su respectivo folder
En el siguiente ejemplo se crea un `enum` para el manejo de estados:
```Typescript
// status.enum.ts
export enum Status {
  PENDING = 'Pendiente',
  PROGRESS = 'En Progreso',
  COMPLETED = 'Completado',
}
```

### 2. Exportar el tipado
Dentro de `index.ts` exporta los contenidos del nuevo `enum`
```Typescript
export * from './enums/status.enum';
```
### 3. Genera/actualiza el `/dist`
En la terminal ejecuta el siguiente commando en el root del proyecto:
```bash
pnpm --filter @repo/types dev
```
### 4. Importa el tipado
Ahora dentro de cualquer aplicación podrás importar los tipados de la siguiente manera:
```Typescript
import { Status } from @repo/types;
```
