import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DeleteResult,
  MoreThan,
  LessThan,
  ILike,
  Between,
} from 'typeorm';
import { CategoriaService } from '../../categoria/service/categoria.service';
import { Produto } from '../entities/produto.entity';
import { calcularHealthScore } from '../util/health-score.helper'; // Importando nosso cérebro nutricional
import { Usuario } from '../../usuario/entities/usuario.entity';
import { TagPreparo } from '../enums/tag-preparo.enum';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,
    private readonly categoriaService: CategoriaService,
  ) {}

  async findAll(): Promise<Produto[]> {
    return this.produtoRepository.find({
      relations: { categoria: true, usuario: true },
    });
  }

  getTagsPreparoMap():{ id: string, label: string }[] {
    return Object.keys(TagPreparo).map(key => {
      return {
        id: TagPreparo[key], // Ex: 'cozido-no-vapor' (o que salva no banco)
        // Transforma a chave 'COZIDO_NO_VAPOR' em 'Cozido No Vapor'
        label: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
      };
    });
  }

  /**
   * MOTOR DE RECOMENDAÇÃO:
   * Retorna os produtos priorizando aqueles com maior Health Score (densidade nutricional).
   * Ideal para a "Vitrine de Saúde" do App.
   */
  async findAllHealthy(): Promise<Produto[]> {
    return this.produtoRepository.find({
      relations: { categoria: true, usuario: true },
      order: { healthScore: 'DESC' }, // RECOMENDAÇÃO: Saudáveis no topo!
    });
  }

  async findById(id: number): Promise<Produto> {
    const resultado = await this.produtoRepository.findOne({
      where: { id },
      relations: { categoria: true, usuario: true },
    });

    if (!resultado) {
      throw new HttpException(
        `Produto com id ${id} não encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }
    return resultado;
  }

  async findAllByNome(nome: string): Promise<Produto[]> {
    return await this.produtoRepository.find({
      where: { nome: ILike(`%${nome}%`) },
      relations: { categoria: true },
      order: { healthScore: 'DESC' }, // Mantém a recomendação na busca por nome
    });
  }

  async create(produto: Produto, usuarioLogadoId: number): Promise<Produto> {
    // 1. Valida se a categoria existe
    await this.categoriaService.findById(produto.categoria.id);

    // 2. MOTOR DE RECOMENDAÇÃO: Calcula a nota baseada nas tags
    produto.healthScore = calcularHealthScore(produto.tagsPreparo);

    // 3. SEGURANÇA: Força o dono do produto a ser o usuário do Token
    // Usamos o 'as any' ou uma interface para evitar erro de tipagem circular do TS
    produto.usuario = { id: usuarioLogadoId } as Usuario;

    const { id, ...novoProduto } = produto;
    return this.produtoRepository.save(novoProduto);
  }

  async update(produto: Produto, usuarioLogadoId: number): Promise<Produto> {
    // 1. Buscamos o produto, mas garantimos que ele pertença ao usuário que enviou a requisição
    const produtoExistente = await this.produtoRepository.findOne({
      where: {
        id: produto.id,
        usuario: { id: usuarioLogadoId }, // Filtro Crítico: O dono tem que ser o mesmo
      },
    });

    if (!produtoExistente) {
      throw new HttpException(
        'Produto não encontrado ou você não tem permissão para editá-lo',
        HttpStatus.FORBIDDEN, // Erro 403: Proibido
      );
    }

    // 2. Se passou, validamos a categoria e recalculamos o score
    await this.categoriaService.findById(produto.categoria.id);
    produto.healthScore = calcularHealthScore(produto.tagsPreparo);

    // 3. Garantimos que o usuário do produto continue sendo o logado (evita troca de dono via JSON)
    produto.usuario = { id: usuarioLogadoId } as Usuario;

    return this.produtoRepository.save(produto);
  }

  async delete(id: number, usuarioLogadoId: number): Promise<DeleteResult> {
    // Tenta encontrar o produto que pertença ao usuário logado
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

  // --- FILTROS DE PREÇO ---

  async findPrecoMoreThan(value: number): Promise<Produto[]> {
    return await this.produtoRepository.find({
      where: { preco: MoreThan(value) },
      relations: { categoria: true },
      order: { preco: 'ASC' },
    });
  }

  async findPrecoLessThan(value: number): Promise<Produto[]> {
    return await this.produtoRepository.find({
      where: { preco: LessThan(value) },
      relations: { categoria: true },
      order: { preco: 'DESC' },
    });
  }

  async findByFaixaDePreco(min: number, max: number): Promise<Produto[]> {
    return this.produtoRepository.find({
      where: { preco: Between(min, max) },
      relations: { categoria: true },
      order: { preco: 'ASC' },
    });
  }
}
