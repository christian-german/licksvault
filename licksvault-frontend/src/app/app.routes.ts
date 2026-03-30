import { Routes } from '@angular/router';
import { LickListComponent } from './components/lick-list/lick-list.component';
import { LickDetailComponent } from './components/lick-detail/lick-detail.component';
import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { CallbackComponent } from './components/callback/callback.component';

export const routes: Routes = [
  { path: 'callback', component: CallbackComponent },
  { path: '', component: LickListComponent, canActivate: [AutoLoginPartialRoutesGuard] },
  { path: 'licks/:id', component: LickDetailComponent, canActivate: [AutoLoginPartialRoutesGuard] },
  { path: '**', redirectTo: '' }
];
