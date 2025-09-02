import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// Bootstrap the Angular application with the provided configuration and register Chart.js
bootstrapApplication(App, {
  ...appConfig,  // Retain the existing app configuration
  providers: [
    ...(appConfig.providers || []),  // Include any existing providers
    provideCharts(withDefaultRegisterables())  // Register Chart.js with default settings
  ]
}).catch((err) => console.error(err));  // Log any errors during the bootstrapping process
