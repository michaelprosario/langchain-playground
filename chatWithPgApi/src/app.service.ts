import { Injectable, Post } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'ok';
  }

  @Post()
  addNumbers(number1: number, number2: number): number {
    return number1 + number2;
  }
}
