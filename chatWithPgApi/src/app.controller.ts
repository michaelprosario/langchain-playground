import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse } from '@nestjs/swagger';


export class AddCommand {
  num1: number;
  num2: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('add')
  @ApiOkResponse({ status: 200 })
  addNumbers(@Body() command: AddCommand): number {
    console.log(command);
    return command.num1 + command.num2;
  }
}
