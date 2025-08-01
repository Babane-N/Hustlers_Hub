import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { BookingsComponent } from './bookings/bookings.component';
import { SearchComponent } from './search/search.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

import { SideBarComponent } from './features/side-bar/side-bar.component';
import { FindServiceComponent } from './features/find-service/find-service.component';
import { ServiceDetailComponent } from './features/service-detail/service-detail.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { BookingDialogComponent } from './features/booking-dialog/booking-dialog.component';
import { PromotionComponent } from './promotion/promotion.component';
import { AdCreatorComponent } from './features/ad-creator/ad-creator.component';
import { HomePageComponent } from './Customer/home-page/home-page.component';
import { RegisterBusinessComponent } from './features/register-business/register-business.component';
import { BusinessSwitcherComponent } from './features/business-switcher/business-switcher.component';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { TopBarComponent } from './features/shared/top-bar/top-bar.component';








@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent,
    BookingsComponent,
    SearchComponent,
    AdminComponent,
    LoginComponent,
    RegisterComponent,
    SideBarComponent,
    FindServiceComponent,
    ServiceDetailComponent,
    DashboardComponent,
    BookingDialogComponent,
    PromotionComponent,
    AdCreatorComponent,
    HomePageComponent,
    RegisterBusinessComponent,
    BusinessSwitcherComponent,
    TopBarComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

