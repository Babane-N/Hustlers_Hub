// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FindServiceComponent } from './features/find-service/find-service.component';
import { ServiceDetailComponent } from './features/service-detail/service-detail.component';
import { BookingsComponent } from './bookings/bookings.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'find-service', component: FindServiceComponent },
  { path: 'service-detail', component: ServiceDetailComponent },
  { path: 'bookings', component: BookingsComponent },
  { path: 'dashboard', component: DashboardComponent },
  // other routes...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
