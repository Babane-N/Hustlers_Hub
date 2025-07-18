// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterBusinessComponent } from './features/register-business/register-business.component';
import { FindServiceComponent } from './features/find-service/find-service.component';
import { ServiceDetailComponent } from './features/service-detail/service-detail.component';
import { BookingsComponent } from './bookings/bookings.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PromotionComponent } from './promotion/promotion.component';
import { AdCreatorComponent } from './features/ad-creator/ad-creator.component';
import { HomePageComponent } from './Customer/home-page/home-page.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'register-business', component: RegisterBusinessComponent },
  { path: 'find-service', component: FindServiceComponent },
  { path: 'service-detail', component: ServiceDetailComponent },
  { path: 'bookings', component: BookingsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'promotion', component: PromotionComponent },
  { path: 'adcreator', component: AdCreatorComponent },
  { path: 'home-page', component: HomePageComponent }
  // other routes...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
