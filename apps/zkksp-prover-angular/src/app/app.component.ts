import { Component } from '@angular/core';
import { SensiletService } from "./service/sensilet.service";

@Component({
  selector: 'root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'zkksp-prover';

  constructor(
    private s: SensiletService
  ) {
  }
}
