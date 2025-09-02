import { ServerRoute, RenderMode } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'explore-developers',
    renderMode: RenderMode.Client, // don’t prerender
  },
  {
    path: 'inquire-developers/:id',
    renderMode: RenderMode.Client, // don’t prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender, // everything else
  }
];
