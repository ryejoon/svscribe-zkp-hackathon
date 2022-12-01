import { Component } from '@angular/core';
import {ConsoleService} from "../service/console.service";

@Component({
  selector: 'console-view',
  template: `
    <div fxLayout="column" class='view-box'>
      <div *ngFor="let row of consoleService.messages" fxLayout="row" fxLayoutAlign="start"
           [style.color]="row.type === 'error' ? 'red' : 'green'">
        <div class="log-tag">{{row.type}}</div>
        <div class="log-row">{{row.message}}</div>
      </div>
    </div> `,
  styles: [`
    .view-box {
      padding: 15px;
      width: 100%;
    }
    .log-row {
      width: 100%;
      overflow-wrap: break-word;
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
