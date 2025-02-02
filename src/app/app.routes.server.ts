import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'confirm/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      // Aquí puedes definir los parámetros que deseas prerenderizar
      // Por ejemplo, si tienes una lista de IDs que deseas prerenderizar
      const ids = await getIdsFromDatabase(); // Esta función debe obtener los IDs desde tu base de datos
      return ids.map(id => ({ id }));
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

async function getIdsFromDatabase() {
  // Implementa esta función para obtener los IDs desde tu base de datos
  return ['id1', 'id2', 'id3']; // Ejemplo de IDs
}