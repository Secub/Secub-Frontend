# Guía vigente de roles simulados de SECUB

Esta guía describe exclusivamente el comportamiento del frontend mientras la autenticación y los datos siguen simulados. El backend deberá validar nuevamente todos los permisos.

## Administración

- Consulta global de información académica.
- Puede filtrar y exportar.
- No crea, actualiza ni elimina contenido académico.
- No inicia nuevos planes académicos.

## Vicerrectoría

- Consulta y seguimiento dentro de su seccional.
- Puede filtrar y exportar la información disponible en su alcance.
- No crea, actualiza ni elimina contenido académico.
- No inicia nuevos planes académicos.

## Decanatura

- Consulta y seguimiento dentro de su seccional y facultad.
- Puede filtrar y exportar la información disponible en su alcance.
- No crea, actualiza ni elimina contenido académico.
- No inicia nuevos planes académicos.

## Dirección de programa

- Gestiona el contenido académico del programa y plan seleccionado.
- Puede crear, consultar, actualizar y eliminar Perfil de Egreso, Propósito de Formación, Competencias y RA, Mapeo, Ciclos y Asignaciones RA.
- Puede gestionar planes de mejora y finalizar el flujo académico.
- Es el único rol que inicia un nuevo plan académico.

## Docencia

- Accede al Dashboard y a Medición RA.
- Solo consulta y registra información de los cursos que tiene asignados.
- Puede guardar o actualizar sus propias mediciones.
- No elimina mediciones ni modifica contenido académico estructural.

## Reglas de interfaz

- Las acciones no autorizadas no se muestran.
- No se presentan mensajes que expliquen qué puede o no puede hacer el rol.
- Una ruta no autorizada redirige al Dashboard.
- El selector de roles existe únicamente cuando `VITE_SHOW_DEMO_TOOLS=true`.

## Alcance de seguridad

El rol simulado puede cambiar mediante herramientas de demostración. Por eso, estos controles no sustituyen la seguridad real. La API debe validar:

- Identidad autenticada.
- Rol.
- Seccional.
- Facultad.
- Programa.
- Plan académico.
- Curso o asignación.
- Estado del recurso.
