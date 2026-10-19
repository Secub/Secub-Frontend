# Guía de roles de SECUB

Describe qué permite el frontend a cada rol. La fuente de verdad es `src/config/access/roles.ts` y `src/config/access/permissions.ts`; si cambian, se actualiza esta guía en el mismo pull request. El backend vuelve a validar todos los permisos.

El rol llega en la sesión del backend. Un rol que no sea uno de los seis oficiales no permite entrar al panel: el selector de programa lo descarta.

## Administrador (`administrador`)

- Consulta global de la información académica, sin restricción de seccional.
- Único rol que filtra por seccional.
- No crea, actualiza ni elimina contenido académico ni ciclos.

## Rector (`rector`)

- Consulta y seguimiento dentro de su seccional, con los mismos permisos de Vicerrector.
- No crea, actualiza ni elimina contenido académico ni ciclos.

## Vicerrector (`vicerrector`)

- Consulta y seguimiento dentro de su seccional; filtra por facultad, programa, plan y estado.
- No crea, actualiza ni elimina contenido académico ni ciclos.

## Decano (`decano`)

- Consulta y seguimiento dentro de su seccional y facultad.
- No crea, actualiza ni elimina contenido académico ni ciclos.

## Dirección de programa (`director`)

- Gestiona el contenido académico del programa y plan seleccionados.
- Crea, consulta, actualiza y elimina Perfil de egreso, Propósito de formación, Competencias y RA, Mapeo, Ciclos, Asignaciones de RA y planes de mejora.
- Exporta a PDF y Excel y descarga el reporte consolidado del ciclo.
- Es el único rol que inicia un plan académico nuevo y que puede eliminar mediciones.

## Docente (`docente`)

- Accede al Dashboard, a los módulos de consulta y a Medición RA.
- Registra y actualiza las mediciones de los cursos que tiene asignados; no las elimina.
- No accede a Mapeo, Ciclo ni Asignar RA.

## Reglas de interfaz

- Las acciones no autorizadas no se muestran.
- Una ruta no autorizada redirige al Dashboard.
- Un registro inactivo no se puede editar, ni siquiera por Dirección de programa.

## Alcance de seguridad

Estos controles no sustituyen la seguridad real. La API debe validar identidad autenticada, rol, seccional, facultad, programa, plan académico, curso o asignación y estado del recurso.
