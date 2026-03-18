import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { Produto } from '../entities/produto.entity';
import { ProdutoService } from '../service/produto.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import type { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';


@ApiTags('Produto')
@Controller('produtos')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  // ==========================================
  // ROTAS PÚBLICAS (Leitura para Clientes)
  // ==========================================

  @Get('/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista todos os produtos' })
  findAll(): Promise<Produto[]> {
    return this.produtoService.findAll();
  }

  @Get('/recomendados')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vitrine: Produtos ordenados pelo melhor Health Score' })
  findAllHealthy(): Promise<Produto[]> {
    return this.produtoService.findAllHealthy(); // A rota que faltava!
  }

  @Get('/tags')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'BFF: Retorna a lista de tags formatadas para o Front-end' })
  getAvailableTags(): { id: string; label: string }[] {
    return this.produtoService.getTagsPreparoMap();
  }

  @Get('faixa-preco/:min/:max')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Filtra produtos por uma faixa de preço' })
  findByFaixaDePreco(
    @Param('min', ParseIntPipe) min: number,
    @Param('max', ParseIntPipe) max: number,
  ): Promise<Produto[]> {
    return this.produtoService.findByFaixaDePreco(min, max); // A rota que faltava!
  }

  @Get('preco-maior-que/:value')
  @HttpCode(HttpStatus.OK)
  findPrecoMoreThan(@Param('value', ParseIntPipe) value: number): Promise<Produto[]> {
    return this.produtoService.findPrecoMoreThan(value);
  }

  @Get('preco-menor-que/:value')
  @HttpCode(HttpStatus.OK)
  findPrecoLessThan(@Param('value', ParseIntPipe) value: number): Promise<Produto[]> {
    return this.produtoService.findPrecoLessThan(value);
  }

  @Get('nome/:nome')
  @HttpCode(HttpStatus.OK)
  findAllByNome(@Param('nome') nome: string): Promise<Produto[]> {
    return this.produtoService.findAllByNome(nome);
  }

  @Get('/:id') // Padrão REST limpo (movido para o final dos GETs estáticos)
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Produto> {
    return this.produtoService.findById(id);
  }

  // ==========================================
  // ROTAS PRIVADAS (Apenas Lojistas Logados)
  // ==========================================

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() produto: Produto, @Req() req: RequestWithUser): Promise<Produto> {
    return this.produtoService.create(produto, req.user.sub.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() produto: Produto, @Req() req: RequestWithUser): Promise<Produto> {
    return this.produtoService.update(produto, req.user.sub.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser): Promise<DeleteResult> {
    return this.produtoService.delete(id, req.user.sub.id);
  }
}