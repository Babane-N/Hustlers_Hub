// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.component';
import { RoleGuard } from './features/auth/role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterBusinessComponent } from './features/register-business/register-business.component';
import { FindServiceComponent } from './features/find-service/find-service.component';
import { ServiceDetailComponent } from './features/service-detail/service-detail.component';
import { BookingsComponent } from './bookings/bookings.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PromotionComponent } from './promotion/promotion.component';
import { ProfileComponent } from './profile/profile.component';
import { AdCreatorComponent } from './features/ad-creator/ad-creator.component';
import { BusinessSwitcherComponent } from './features/business-switcher/business-switcher.component';
import { HomePageComponent } from './Customer/home-page/home-page.component';
import { BookingDialogComponent } from './features/booking-dialog/booking-dialog.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'home-page', component: HomePageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'business-switcher', component: BusinessSwitcherComponent },
  { path: 'find-service', component: FindServiceComponent },
  { path: 'service-detail/:id', component: ServiceDetailComponent },
  { path: 'bookings', component: BookingsComponent },
  { path: 'profile', component: ProfileComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Business', 'Admin'] } // 👈 Only allow business & admin
  },
  {
    path: 'adcreator',
    component: AdCreatorComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Business', 'Customer'] } // 👈 Only allow business
  },
  {
    path: 'promotion',
    component: PromotionComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Customer', 'Business', 'Admin'] }
  },
  {
    path: 'register-business',
    component: RegisterBusinessComponent,
    canActivate: [RoleGuard],
    data: {roles: ['Customer', 'Business', 'Admin']}
  },
  {
    path: 'booking-dialog',
    component: BookingDialogComponent,
    canActivate: [RoleGuard],
    data: {roles: ['Customer', 'Business', 'Admin']}
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
