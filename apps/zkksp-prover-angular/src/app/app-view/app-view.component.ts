import { Component, Input } from '@angular/core';
import {App} from "@zkp-hackathon/common";

@Component({
  selector: 'app-view',
  template: `
    <div fxLayout="column">
      <div>{{app.name}}</div>
      <div>{{app.description}}</div>
      <div>{{app.priceSatoshis}} satoshi for {{app.durationSeconds}} seconds</div>
    </div> `,
  styles: [],
})
export class AppViewComponent {

  @Input() app: App;

}
