import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { CategoriaService } from '../../categoria/service/categoria.service';
import { Produto } from '../entities/produto.entity';
import { calcularHealthScore } from '../util/health-score.helper';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { TagPreparo } from '../enums/tag-preparo.enum';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,
    private readonly categoriaService: CategoriaService,
  ) {}

  /**
   * UTILITÁRIO INTERNO: Cria a query base para buscar produtos.
   * Traz a Categoria e o Usuário (Dono), mas seleciona APENAS dados seguros do usuário,
   * garantindo que a senha jamais saia do banco de dados.
   */
  private createBaseQuery() {
    return this.produtoRepository.createQueryBuilder('produto')
      .leftJoinAndSelect('produto.categoria', 'categoria') // Traz tudo da categoria
      .leftJoin('produto.usuario', 'usuario')              // Faz o join com usuário
      .addSelect(['usuario.id', 'usuario.nome', 'usuario.usuario']); // Escolhe só o que é seguro
  }

  getTagsPreparoMap(): { id: string, label: string }[] {
    return Object.keys(TagPreparo).map(key => {
      return {
        id: TagPreparo[key],
        label: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
      };
    });
  }

  // ==========================================
  // ROTAS DE BUSCA (READ) - Usando QueryBuilder
  // ==========================================

  async findAll(): Promise<Produto[]> {
    return await this.createBaseQuery().getMany();
  }

  async findAllHealthy(): Promise<Produto[]> {
    return await this.createBaseQuery()
      .orderBy('produto.healthScore', 'DESC') // RECOMENDAÇÃO: Saudáveis no topo!
      .getMany();
  }

  async findById(id: number): Promise<Produto> {
    const resultado = await this.createBaseQuery()
      .where('produto.id = :id', { id })
      .getOne();

    if (!resultado) {
      throw new HttpException(`Produto com id ${id} não encontrado`, HttpStatus.NOT_FOUND);
    }
    return resultado;
  }

  async findAllByNome(nome: string): Promise<Produto[]> {
    return await this.createBaseQuery()
      .where('produto.nome ILIKE :nome', { nome: `%${nome}%` })
      .orderBy('produto.healthScore', 'DESC')
      .getMany();
  }

  async findPrecoMoreThan(value: number): Promise<Produto[]> {
    return await this.createBaseQuery()
      .where('produto.preco > :value', { value })
      .orderBy('produto.preco', 'ASC')
      .getMany();
  }

  async findPrecoLessThan(value: number): Promise<Produto[]> {
    return await this.createBaseQuery()
      .where('produto.preco < :value', { value })
      .orderBy('produto.preco', 'DESC')
      .getMany();
  }

  async findByFaixaDePreco(min: number, max: number): Promise<Produto[]> {
    return await this.createBaseQuery()
      .where('produto.preco BETWEEN :min AND :max', { min, max })
      .orderBy('produto.preco', 'ASC')
      .getMany();
  }

  // ==========================================
  // ROTAS DE ESCRITA (CREATE, UPDATE, DELETE)
  // ==========================================

  async create(produto: Produto, usuarioLogadoId: number): Promise<Produto> {
    await this.categoriaService.findById(produto.categoria.id);
    produto.tagsPreparo= Array.from(new Set(produto.tagsPreparo));
    if(produto.tagsPreparo.length < 3){
      throw new HttpException(`Tags de Preparo precisa conter 3 tags diferentes`, HttpStatus.BAD_REQUEST);
    }
    produto.healthScore = calcularHealthScore(produto.tagsPreparo);
    produto.usuario = { id: usuarioLogadoId } as Usuario;

    const { id, ...novoProduto } = produto;
    return this.produtoRepository.save(novoProduto);
  }

  async update(produto: Produto, usuarioLogadoId: number): Promise<Produto> {
    // Mantemos o findOne simples aqui porque ele serve só para validação interna, não é retornado
    const produtoExistente = await this.produtoRepository.findOne({
      where: {
        id: produto.id,
        usuario: { id: usuarioLogadoId },
      },
    });

    if (!produtoExistente) {
      throw new HttpException(
        'Produto não encontrado ou você não tem permissão para editá-lo',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.categoriaService.findById(produto.categoria.id);
    produto.healthScore = calcularHealthScore(produto.tagsPreparo);
    produto.usuario = { id: usuarioLogadoId } as Usuario;

    return this.produtoRepository.save(produto);
  }

  async delete(id: number, usuarioLogadoId: number): Promise<DeleteResult> {
    const produto = await this.produtoRepository.findOne({
      where: { id, usuario: { id: usuarioLogadoId } },
    });

    if (!produto) {
      throw new HttpException(
        'Produto não existe ou não pertence à sua conta',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.produtoRepository.delete(id);
  }
}