import { Controller, Get, Render } from '@nestjs/common';
import { Todo } from '@zkp-hackathon/todos';
import axios from 'axios';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get()
  @Render('index')
  async root() {
    return {
      todos: await this.getData(),
    };
  }

  async getData() {
    try {
      const response = await axios.get<Todo[]>(
        process.env.apiPath || 'http://localhost:3333'
      );
      return response.data;
    } catch (e) {
      console.error(e);
    }
  }
}
