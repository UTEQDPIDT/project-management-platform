import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! The ci pipeline is working and the API is up.';
  }
}
