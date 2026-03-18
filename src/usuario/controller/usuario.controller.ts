import { Controller, Get, Post, Body, Param, Put, ParseIntPipe, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { UsuarioService } from '../service/usuario.service';
import { Usuario } from '../entities/usuario.entity';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
// Importando a interface que acabamos de criar na pasta auth!
import type { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';

@ApiTags('Usuario')
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // Rota PÚBLICA (Não precisa de token para se cadastrar)
  @Post('/cadastrar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastra um novo restaurante/usuário' })
  create(@Body() usuario: Usuario) {
    return this.usuarioService.create(usuario);
  }

 
  @UseGuards(JwtAuthGuard)
  @Get('/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista todos os usuários (Oculta a senha)' })
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Busca um usuário por ID (Oculta a senha)' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findById(id);
  }
  
  // Rotas PRIVADAS (Exigem token)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/atualizar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza o perfil do usuário logado' })
  update(
    @Body() usuario: Usuario,
    @Req() req: RequestWithUser // Pegando a requisição com a nossa interface tipada
  ) {
    // Agora sim! Passamos o objeto E o ID seguro do Token para o Service
    return this.usuarioService.update(usuario, req.user.sub.id);
  }
}