# Sistema de Auditoría de Medición RA

## Descripción General

El sistema de Medición RA incluye un registro automático de timestamps (fechas) de creación y modificación para cada registro. Estos datos se guardan internamente (no son visibles en la UI) y están listos para ser consumidos por una base de datos.

## Variables de Auditoría

### `createdAt`
- **Tipo**: `string | undefined` (ISO 8601)
- **Ruta**: `MedicionRaDemoState.createdAt`
- **Descripción**: Timestamp de creación del registro
- **Comportamiento**: 
  - Se genera automáticamente en la primera creación
  - NO cambia en actualizaciones posteriores
  - Es inmutable para el mismo registro
- **Formato**: `"2024-06-01T14:30:45.123Z"`
- **Ejemplo**: `"2024-06-01T14:30:45.123Z"`

### `updatedAt`
- **Tipo**: `string | undefined` (ISO 8601)
- **Ruta**: `MedicionRaDemoState.updatedAt`
- **Descripción**: Timestamp de última modificación
- **Comportamiento**:
  - Se actualiza automáticamente en cada cambio
  - Se cambia cada vez que el registro se persiste
  - Refleja la última acción realizada
- **Formato**: `"2024-06-01T14:35:20.456Z"`
- **Ejemplo**: `"2024-06-01T14:35:20.456Z"`

## Gestión Automática del Backend

Estos timestamps son manejados automáticamente por la función `decorateRecord()` en `mockBackend.service.ts`:

```typescript
function decorateRecord<T extends MockBackendRecord>(record: T, user?: MockBackendUser | null): T {
  const now = new Date().toISOString();
  
  return {
    ...record,
    // ... otros campos ...
    createdAt: record.createdAt ?? now,  // Se mantiene si existe
    updatedAt: now,                       // Siempre se actualiza
  };
}
```

## Ejemplos de Consumo

### 1. Extraer datos de auditoría de un registro

```typescript
import { extractMedicionRaAuditInfo } from './utils/medicionRA.persistence';
import type { MedicionRaDemoState } from './types/medicionRA.persistence.types';

// Obtener un registro
const record: MedicionRaDemoState = mockBackend.getById<MedicionRaDemoState>(
  'medicionesRa',
  'medicion-ra-demo-state-user-123-ciclo-456'
);

// Extraer información de auditoría
const auditInfo = extractMedicionRaAuditInfo(record);
console.log('Creado:', auditInfo.createdAt);
console.log('Modificado:', auditInfo.updatedAt);
console.log('¿Fue modificado?', auditInfo.isModified);
console.log('Días desde creación:', auditInfo.daysSinceCreation);
```

### 2. Obtener todos los registros con auditoría

```typescript
import { mockBackend } from '../../services/mockBackend';
import type { MedicionRaDemoState } from './types/medicionRA.persistence.types';
import { extractMedicionRaAuditInfo } from './utils/medicionRA.persistence';

// Obtener todos los registros
const allRecords = mockBackend.list<MedicionRaDemoState>('medicionesRa');

// Mapear a formato de auditoría
const auditRecords = allRecords.map(record => ({
  id: record.id,
  userId: record.userId,
  cicloId: record.cicloId,
  ...extractMedicionRaAuditInfo(record),
}));

console.table(auditRecords);
```

### 3. Preparar datos para envío a Base de Datos

```typescript
// Función para convertir registros a formato de BD
function prepareMedicionRaForDatabase(record: MedicionRaDemoState) {
  const auditInfo = extractMedicionRaAuditInfo(record);
  
  return {
    id: record.id,
    ciclo_id: record.cicloId,
    usuario_id: record.userId,
    seccional_id: record.seccionalId,
    facultad_id: record.facultadId,
    programa_id: record.programaId,
    plan_id: record.planId,
    created_at: auditInfo.createdAt,
    updated_at: auditInfo.updatedAt,
    is_modified: auditInfo.isModified,
    days_since_creation: auditInfo.daysSinceCreation,
    // ... otros campos del registro ...
  };
}

// Usar la función
const records = mockBackend.list<MedicionRaDemoState>('medicionesRa');
const dbRecords = records.map(prepareMedicionRaForDatabase);
```

### 4. Ejemplo SQL para Base de Datos

```sql
-- Crear tabla de auditoría
CREATE TABLE mediciones_ra_audit (
  id VARCHAR(255) PRIMARY KEY,
  ciclo_id VARCHAR(255),
  usuario_id VARCHAR(255),
  seccional_id VARCHAR(255),
  facultad_id VARCHAR(255),
  programa_id VARCHAR(255),
  plan_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  is_modified BOOLEAN,
  days_since_creation INT,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos desde el frontend
INSERT INTO mediciones_ra_audit (
  id, ciclo_id, usuario_id, seccional_id, facultad_id, 
  programa_id, plan_id, created_at, updated_at, is_modified, days_since_creation
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Consultas útiles
-- Registros modificados en los últimos 7 días
SELECT * FROM mediciones_ra_audit
WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY updated_at DESC;

-- Tiempo de trabajo en cada evaluación
SELECT 
  id,
  created_at,
  updated_at,
  TIMESTAMPDIFF(HOUR, created_at, updated_at) as horas_trabajadas,
  TIMESTAMPDIFF(MINUTE, created_at, updated_at) as minutos_trabajados
FROM mediciones_ra_audit
WHERE created_at >= '2024-06-01'
ORDER BY horas_trabajadas DESC;

-- Reporte de auditoría por usuario
SELECT 
  usuario_id,
  COUNT(*) as total_mediciones,
  MIN(created_at) as primera_medicion,
  MAX(updated_at) as ultima_actualizacion,
  COUNT(CASE WHEN is_modified THEN 1 END) as mediciones_modificadas
FROM mediciones_ra_audit
GROUP BY usuario_id;
```

## Dónde se Actualiza la Auditoría

Los timestamps se actualizan en los siguientes puntos:

1. **Creación de Medición RA** (`useMedicionRAPersistence.ts`)
   - Se establece `createdAt` automáticamente
   - Se establece `updatedAt` al momento de creación

2. **Guardado de Evaluaciones** (en cualquier cambio)
   - `createdAt` se preserva
   - `updatedAt` se actualiza con la fecha actual

3. **Guardado de Evidencia/Instrumentos/Planes de Mejora**
   - `updatedAt` se actualiza

## Notas Importantes

- Los timestamps son **no visuales** (no aparecen en la interfaz de usuario)
- Los valores se guardan en **localStorage** (útil para demo)
- En producción, debería sincronizarse con una base de datos real
- Los timestamps están en formato **ISO 8601** (estándar internacional)
- La función `extractMedicionRaAuditInfo()` proporciona utilidades para derivar información adicional

## Integración con Base de Datos Real

Cuando se integre con una base de datos real (backend):

```typescript
// En useMedicionRAPersistence.ts, después de upsert:

const records = mockBackend.list<MedicionRaDemoState>('medicionesRa');
const auditData = records.map(record => ({
  id: record.id,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
}));

// Enviar al backend
await fetch('/api/mediciones-ra/audit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(auditData),
});
```
