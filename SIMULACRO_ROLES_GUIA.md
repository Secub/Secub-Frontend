# Guía: Sistema de Simulacro de Roles - Competencias RA

## 🎯 Objetivo
Implementar un sistema de roles que controle dinámicamente qué funciones están disponibles según el rol del usuario autenticado.

## 🔄 Cómo Funciona

### 1. **Selector de Roles en Desarrollo**
El componente `DevRoleSelector` aparece en la esquina superior derecha del módulo de Competencias RA (panel de acciones). Permite cambiar entre estos roles:

- 👑 **Admin** (Super Admin) - Acceso completo
- 🏛️ **Vice** (Vicerrector) - Acceso administrativo por seccional
- 🎓 **Decano** - Gestión a nivel de facultad
- 📚 **Director** - Gestión a nivel de programa
- 👨‍🏫 **Docente** - Acceso de solo lectura

### 2. **Control de Filtros**
Los filtros disponibles dependen del rol:

| Filtro | Admin | Vice | Decano | Director | Docente |
|--------|-------|------|--------|----------|---------|
| Seccional | ✅ | ❌ | ❌ | ❌ | ❌ |
| Lugar Desarrollo | ✅ | ✅ | ❌ | ❌ | ❌ |
| Facultad | ✅ | ✅ | ❌ | ❌ | ❌ |
| Programa | ✅ | ✅ | ✅ | ✅ | ✅ |
| Plan Estudios | ✅ | ✅ | ✅ | ✅ | ✅ |
| Estado | ✅ | ✅ | ✅ | ✅ | ✅ |

### 3. **Control de Acciones**
Las acciones sobre competencias se controlan por rol:

| Acción | Admin | Vice | Decano | Director | Docente |
|--------|-------|------|--------|----------|---------|
| Crear | ✅ | ❌ | ❌ | ✅ | ❌ |
| Editar | ✅* | ❌ | ❌ | ✅* | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ | ❌ |
| Exportar PDF | ✅ | ✅ | ✅ | ✅ | ✅ |
| Exportar Excel | ✅ | ✅ | ✅ | ✅ | ✅ |

*Solo si el programa está en estado "activo"

## 📝 Cambios Implementados

### 1. **Tipos actualizados** (`CompetenciasRa.types.ts`)
```typescript
export interface RolePermissions {
  canFilterByLugar: boolean; // ← AGREGADO
  // ... otros permisos
}
```

### 2. **Permisos configurados** (`CompetenciasRa.permissions.ts`)
```typescript
export const rolePermissions: Record<CompetenciasRaFormacionRole, RolePermissions> = {
  admin: { canFilterByLugar: true, canDelete: true, ... },
  vice: { canFilterByLugar: true, canDelete: false, ... },
  decano: { canFilterByLugar: false, canDelete: false, ... },
  director: { canFilterByLugar: false, canDelete: false, ... },
  docente: { canFilterByLugar: false, canDelete: false, ... },
};
```

### 3. **Filtros controlados** (`CompetenciasRaFilters.tsx`)
```typescript
{permissions.canFilterByLugar ? (
  <Select label="Lugar de desarrollo" ... />
) : null}
```

### 4. **Selector integrado** (`CompetenciasRAPage.tsx`)
```typescript
import DevRoleSelector from "../../../components/panel/DevRoleSelector";

const pageActions = (
  <div className="flex flex-wrap items-center gap-3">
    <DevRoleSelector /> {/* ← Selector de rol */}
    {/* ... botones de acción */}
  </div>
);
```

## 🧪 Cómo Probar

1. **Abre el módulo de Competencias RA**
2. **Busca el selector de rol** en la esquina superior derecha (aparece como dropdown "Rol demo")
3. **Cambia entre roles** y observa:
   - Filtros que aparecen/desaparecen
   - Botones de crear/editar/eliminar que se activan/desactivan
   - Mensajes de permiso denegado en los botones deshabilitados

## 🔒 Validaciones

El sistema valida automáticamente:

- **Filtros**: Solo muestra los que el rol permite
- **Botones**: Desactiva los que el rol no permite, mostrando tooltip de razón
- **Edición**: Verifica tanto el permiso del rol como el estado "activo" del registro
- **Eliminación**: Solo disponible para admin (por diseño)

## 📂 Estructura de Permisos

Los permisos se definen centralizadamente en `CompetenciasRa.permissions.ts` y se usan en:
- `CompetenciasRaFiltersPanel` - Mostrar/ocultar filtros
- `CompetenciasRaCardGrid` - Habilitar/deshabilitar botones de acción
- `CompetenciasRAPage` - Mostrar/ocultar botón de crear

## 🚀 Próximas Mejoras (Opcionales)

- Persistir el rol seleccionado en localStorage
- Agregar auditoría de cambios por rol
- Implementar notificaciones cuando se deniega acceso
- Agregar más roles si es necesario
