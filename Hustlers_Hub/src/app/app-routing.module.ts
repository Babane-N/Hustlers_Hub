// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.component';
import { RoleGuard } from './features/auth/role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { ForgetPasswordComponent } from './features/auth/forget-password/forget-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
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
import { MyBookingsComponent } from './Customer/my-bookings/my-bookings.component';
import { AdminComponent } from './Admin/admin/admin.component';
import { PendingBusinessesComponent } from './Admin/pending-businesses/pending-businesses.component';
import { BookingDetailComponent } from './features/booking-detail/booking-detail.component';
import { EditBusinessComponent } from './features/edit-business/edit-business.component';
import { BusinessImageUploadComponent } from './features/business-image-upload/business-image-upload.component';

const routes: Routes = [

  // =========================
  // PUBLIC ROUTES
  // =========================
  { path: '', component: HomePageComponent },
  { path: 'home-page', component: HomePageComponent },
  { path: 'home', component: HomeComponent },
  { path: 'find-service', component: FindServiceComponent },
  { path: 'service-detail/:id', component: ServiceDetailComponent },

  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgetPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // =========================
  // AUTHENTICATED – NO SERVICE REQUIRED
  // =========================
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Customer', 'Business', 'Admin'],
      requiresService: false
    }
  },

  {
    path: 'edit-business',
    component: EditBusinessComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Customer', 'Business', 'Admin'],
      requiresService: false
    }
  },

  {
    path: 'my-bookings',
    component: MyBookingsComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Customer'],
      requiresService: false
    }
  },

  {
    path: 'booking-detail/:id',
    component: BookingDetailComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Customer', 'Business', 'Admin'],
      requiresService: false
    }
  },

  // =========================
  // BUSINESS – SERVICE SELECTION
  // =========================
  {
    path: 'business-switcher',
    component: BusinessSwitcherComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Business', 'Admin'],
      requiresService: false
    }
  },

  {
    path: 'register-business',
    component: RegisterBusinessComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Customer', 'Business'],
      requiresService: false
    }
  },

  // =========================
  // BUSINESS – SERVICE CONTEXT REQUIRED
  // =========================
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Business', 'Admin'],
      requiresService: true
    }
  },

  {
    path: 'business-image-upload',
    component: BusinessImageUploadComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Business', 'Admin'],
      requiresService: true
    }
  },

  {
    path: 'bookings',
    component: BookingsComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Business', 'Admin'],
      requiresService: true
    }
  },

  {
    path: 'adcreator',
    component: AdCreatorComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Business', 'Customer', 'Admin'],
      requiresService: true
    }
  },

  {
    path: 'promotion',
    component: PromotionComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Customer', 'Business', 'Admin'],
      requiresService: false
    }
  },

  // =========================
  // ADMIN ONLY
  // =========================
  {
    path: 'Admin',
    component: AdminComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Admin'],
      requiresService: false
    }
  },

  {
    path: 'pending-businesses',
    component: PendingBusinessesComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['Admin', "Business"],
      requiresService: false
    }
  },

  // =========================
  // FALLBACK
  // =========================
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
