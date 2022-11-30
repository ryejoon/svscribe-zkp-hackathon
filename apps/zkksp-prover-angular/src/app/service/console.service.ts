import {Injectable} from '@angular/core';

export type LogType = 'log' | 'error';

export type LogItem = {
  type?: LogType,
  message: string
}
@Injectable({
  providedIn: 'root'
})
export class ConsoleService {

  public messages: LogItem[] = [];
  public addMessage(message: string, type?: LogType) {
    if (!message) {
      return;
    }
    this.messages.push(...message.split("\n").map(m => ({ type: type ?? 'log', message: m })))
  }
}
