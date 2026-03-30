import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfigService } from './services/config.service';
import { authInterceptor, provideAuth, StsConfigLoader } from 'angular-auth-oidc-client';
import { map } from 'rxjs';

export class DynamicConfigLoader implements StsConfigLoader {
  constructor(private configService: ConfigService) {}

  loadConfigs() {
    return this.configService.configObservable.pipe(
      map((config) => {
        const authority = config.oidc.authority;

        return [{
          authority: authority,
          redirectUrl: config.oidc.redirectUri,
          postLogoutRedirectUri: config.oidc.postLogoutRedirectUri,
          clientId: config.oidc.clientId,
          scope: config.oidc.scope,
          responseType: 'code',
          silentRenew: true,
          useRefreshToken: true,
          secureRoutes: [config.apiUrl],
        }];
      })
    );
  }
}

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{amber.50}',
            100: '{amber.100}',
            200: '{amber.200}',
            300: '{amber.300}',
            400: '{amber.400}',
            500: '{amber.500}',
            600: '{amber.600}',
            700: '{amber.700}',
            800: '{amber.800}',
            900: '{amber.900}',
            950: '{amber.950}'
        }
    }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor()])),
    provideAuth({
      loader: {
        provide: StsConfigLoader,
        useFactory: (configService: ConfigService) => new DynamicConfigLoader(configService),
        deps: [ConfigService],
      },
    }),
    provideAnimations(),
    providePrimeNG({
        theme: {
            preset: MyPreset,
            options: {
                darkModeSelector: false
            }
        }
    }),
    MessageService,
    ConfirmationService,
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () => configService.loadConfig(),
      deps: [ConfigService],
      multi: true
    }
  ]
};
