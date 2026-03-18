import { Type, Transform, TransformFnParams } from 'class-transformer';
import {
  IsNotEmpty,
  Length,
  IsNumber,
  Min,
  IsOptional,
  IsUrl,
  IsObject,
  IsArray,
  ArrayMinSize,
  ArrayUnique,
  IsEnum,
} from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { NumericTransformer } from '../../util/NumericTransformer';
import { ApiProperty } from '@nestjs/swagger';
import { TagPreparo } from '../enums/tag-preparo.enum';

@Entity({ name: 'tb_produtos' })
export class Produto {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'ID único do produto' })
  id: number;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'O nome do produto é obrigatório' })
  @Length(4, 60, { message: 'O nome deve ter entre 4 e 60 caracteres' })
  @ApiProperty({ example: 'Salada de Quinoa Real' })
  @Column({ length: 60, nullable: false })
  nome: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @Length(10, 255, { message: 'A descrição deve ter entre 10 e 255 caracteres' }) // MENSAGEM CORRIGIDA
  @ApiProperty({ example: 'Deliciosa salada in-natura com frango grelhado e sementes.' })
  @Column({ length: 255, nullable: false })
  descricao: string;

  @IsNotEmpty({ message: 'O preço do produto é obrigatório' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O preço deve ter no máximo 2 casas decimais' })
  @Min(0, { message: 'O preço não pode ser negativo' })
  @Type(() => Number)
  @ApiProperty({ example: 35.90 })
  @Column('decimal', {
    precision: 6,
    scale: 2,
    nullable: false,
    transformer: new NumericTransformer(),
  })
  preco: number;

  @IsOptional()
  @IsUrl({}, { message: 'A URL da imagem informada é inválida' })
  @ApiProperty({ example: 'https://meubucket.s3.com/salada.jpg', required: false })
  @Column('varchar', { length: 255, nullable: true })
  imgUrl: string;

  // =========================================================
  // MOTOR DE RECOMENDAÇÃO: TAGS E HEALTH SCORE
  // =========================================================

  @IsNotEmpty({ message: 'As tags de preparo são obrigatórias.' })
  @IsArray({ message: 'As tags devem ser enviadas em formato de lista (array).' })
  @ArrayMinSize(3, { message: 'O produto precisa ter pelo menos 3 tags de preparo.' })
  @ArrayUnique({ message: 'Não envie tags duplicadas.' })
  @IsEnum(TagPreparo, { each: true, message: 'Uma ou mais tags informadas são inválidas.' })
  @ApiProperty({
    description: 'Lista de tags nutricionais e de preparo',
    enum: TagPreparo,
    isArray: true,
    example: [TagPreparo.IN_NATURA, TagPreparo.RICO_EM_PROTEINA, TagPreparo.BAIXO_SODIO],
  })
  @Column('simple-array', { nullable: false })
  tagsPreparo: TagPreparo[]; // NOME CORRIGIDO

  @ApiProperty({ 
    example: 85, 
    description: 'Nota de saúde calculada pelo sistema (0 a 100). Preenchimento automático pelo backend.' 
  })
  @Column({ type: 'int', default: 50 })
  healthScore: number; // CAMPO ADICIONADO PARA SALVAR A NOTA

  // =========================================================
  // RELACIONAMENTOS (FOREIGN KEYS)
  // =========================================================

  @IsObject({ message: 'A Categoria precisa ser um objeto válido' })
  @Type(() => Categoria)
  @ApiProperty({ type: () => Categoria, example: { id: 1 } })
  @ManyToOne(() => Categoria, (categoria) => categoria.produtos, {
    onDelete: 'CASCADE',
  })
  categoria: Categoria;

  @IsObject({ message: 'O Usuário (Restaurante) precisa ser um objeto válido' })
  @Type(() => Usuario)
  @ApiProperty({ type: () => Usuario, example: { id: 1 } })
  @ManyToOne(() => Usuario, (usuario) => usuario.produtos, {
    onDelete: 'CASCADE',
  })
  usuario: Usuario;
}