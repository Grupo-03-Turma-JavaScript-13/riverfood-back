import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, Put, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CategoriaService } from '../service/categoria.service';
import { Categoria } from '../entities/categoria.entity';
import { DeleteResult } from 'typeorm';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

@ApiTags('Categoria')
@Controller('categorias')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  // ROTA PÚBLICA: Qualquer um pode ver as categorias
  @Get('/all')
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Categoria[]> {
    return this.categoriaService.findAll();
  }


  // ROTA PÚBLICA: Buscar por descrição (Ajustado conforme a Entity)
  @Get('descricao/:descricao')
  @HttpCode(HttpStatus.OK)
  findByDescricao(@Param('descricao') descricao: string): Promise<Categoria[]> {
    return this.categoriaService.findByDescricao(descricao);
  }

  // ROTA PÚBLICA: Buscar por ID
  @Get(':id') // Removi o 'id/:id' para ficar mais limpo: /categorias/1
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Categoria> {
    return this.categoriaService.findById(id);
  }

  // ROTAS PROTEGIDAS: Apenas usuários logados podem alterar o catálogo
  
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() categoria: Categoria): Promise<Categoria> {
    return this.categoriaService.create(categoria);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() categoria: Categoria): Promise<Categoria> {
    return this.categoriaService.update(categoria);
  }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Delete(":id")
  // @HttpCode(HttpStatus.NO_CONTENT)
  // delete(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
  //   return this.categoriaService.delete(id);
  // }
}