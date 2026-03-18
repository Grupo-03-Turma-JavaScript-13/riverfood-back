import { Transform, Type, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, Length } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Produto } from '../../produto/entities/produto.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'tb_categorias' })
export class Categoria {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'ID único da categoria' })
  id: number;

  // CORREÇÃO: O desafio pediu explicitamente o atributo "descricao" em vez de "nome"
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'A descrição da categoria é obrigatória' })
  @Length(4, 60, { message: 'A descrição da categoria deve ter entre 4 e 60 caracteres' })
  @ApiProperty({ example: 'Saladas e Bowls', description: 'Nome descritivo da categoria' })
  @Column({ name: 'descricao', length: 60, nullable: false }) // Mantive o nome da coluna explícito no banco
  descricao: string;

  // =========================================================
  // RELACIONAMENTOS
  // =========================================================

  @OneToMany(() => Produto, (produto) => produto.categoria)
  @Type(() => Produto)
  produtos: Produto[];
}