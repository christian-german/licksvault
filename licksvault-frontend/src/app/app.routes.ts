import { Routes } from '@angular/router';
import { LickListComponent } from './components/lick-list/lick-list.component';
import { LickDetailComponent } from './components/lick-detail/lick-detail.component';
import { LickCreateComponent } from './components/lick-create/lick-create.component';

export const routes: Routes = [
  { path: '', component: LickListComponent },
  { path: 'licks/new', component: LickCreateComponent },
  { path: 'licks/:id', component: LickDetailComponent },
  { path: '**', redirectTo: '' }
];
