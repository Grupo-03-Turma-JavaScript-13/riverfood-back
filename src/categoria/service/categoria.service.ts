import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from '../entities/categoria.entity';
import { DeleteResult, ILike, Repository } from 'typeorm';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  async findAll(): Promise<Categoria[]> {
    // Retorna todas as categorias com seus respectivos produtos
    return await this.categoriaRepository.find({
      relations: { produtos: true },
    });
  }

  async findById(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      relations: { produtos: true }, // Importante para ver os produtos daquela categoria
    });

    if (!categoria) {
      throw new HttpException('Categoria não encontrada!', HttpStatus.NOT_FOUND);
    }

    return categoria;
  }

  // Ajustado para 'descricao' conforme o desafio pede
  async findByDescricao(descricao: string): Promise<Categoria[]> {
    return await this.categoriaRepository.find({
      where: { descricao: ILike(`%${descricao}%`) },
      relations: { produtos: true },
    });
  }

  async create(categoria: Categoria): Promise<Categoria> {
    // Garantimos que o ID não seja enviado para que o banco gere um novo
    const { id, ...dadosCategoria } = categoria;
    return await this.categoriaRepository.save(dadosCategoria);
  }

  async update(categoria: Categoria): Promise<Categoria> {
    // Verificamos se a categoria existe antes de atualizar
    const buscaCategoria = await this.findById(categoria.id);
    
    // O save no TypeORM faz o "upsert": se o ID existe, ele atualiza
    return await this.categoriaRepository.save({
      ...buscaCategoria,
      ...categoria
    });
  }

  // async delete(id: number): Promise<DeleteResult> {
  //   // Reutiliza o findById para validar a existência e já disparar o 404 se não existir
  //   await this.findById(id);
  //   return await this.categoriaRepository.delete(id);
  // }
}