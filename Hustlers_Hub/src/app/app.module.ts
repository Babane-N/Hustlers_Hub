import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { BookingsComponent } from './bookings/bookings.component';
import { SearchComponent } from './search/search.component';
import { AdminComponent } from './Admin/admin/admin.component';
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
import { MyBookingsComponent } from './Customer/my-bookings/my-bookings.component';
import { PendingBusinessesComponent } from './Admin/pending-businesses/pending-businesses.component';
import { BookingDetailComponent } from './features/booking-detail/booking-detail.component';
import { EditBusinessComponent } from './features/edit-business/edit-business.component';

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
import { MatMenuModule } from '@angular/material/menu';
import { GoogleMapsModule } from '@angular/google-maps';
import { SocialLoginModule, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from '@abacritt/angularx-social-login';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';






@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
    TopBarComponent,
    MyBookingsComponent,
    PendingBusinessesComponent,
    BookingDetailComponent,
    EditBusinessComponent
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
    ReactiveFormsModule,
    MatMenuModule,
    GoogleMapsModule,
    SocialLoginModule,
    BrowserAnimationsModule 
  ],
  providers: [
    provideAnimationsAsync(),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('839640505539-n3m49mpd2jttrb9uiga4f0uvlrpqf0di.apps.googleusercontent.com')
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('987654321098765')
          }
        ],
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

