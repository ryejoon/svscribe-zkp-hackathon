import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { ProverClientMainComponent } from './prover-client-main/prover-client-main.component';
import {HttpClientModule} from "@angular/common/http";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@NgModule({
  declarations: [AppComponent, ProverClientMainComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot(appRoutes, {initialNavigation: 'enabledBlocking'}),
        HttpClientModule,
        MatProgressSpinnerModule
    ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}