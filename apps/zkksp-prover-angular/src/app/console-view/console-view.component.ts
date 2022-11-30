import { Component } from '@angular/core';
import {ConsoleService} from "../service/console.service";

@Component({
  selector: 'console-view',
  template: `
    <div fxLayout="column" class='view-box'>
      <div *ngFor="let row of consoleService.messages" fxLayout="row" fxLayoutAlign="start"
           [style.color]="row.type === 'error' ? 'red' : 'green'">
        <div class="log-tag">{{row.type}}</div>
        <div >{{row.message}}</div>
      </div>
    </div> `,
  styles: [`
    .view-box {
      padding: 15px;
    }
    .log-tag {
      width: 50px;
      padding-right: 10px;
    }
  `],
})
export class ConsoleViewComponent {

  constructor(
    public consoleService: ConsoleService
  ) {
  }
}
