import { Controller, Get, HttpStatus, Redirect } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';


@Controller()
export class AppController {

  @ApiExcludeEndpoint()
  @Get()
  @Redirect('swagger',HttpStatus.FOUND)
  getSwagger(){
    return {};
  }
}
