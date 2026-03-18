import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Produto } from "../../produto/entities/produto.entity";
import { Type } from 'class-transformer';

@Entity({ name: "tb_usuarios" })
export class Usuario {

    @PrimaryGeneratedColumn() 
    @ApiProperty({ example: 1 })
    id: number;

    @IsNotEmpty({ message: 'O nome do restaurante/usuário é obrigatório' })
    @IsString()
    @Column({ length: 255, nullable: false }) 
    @ApiProperty({ example: "Restaurante Fit da Praça" })
    nome: string;

    @IsEmail({}, { message: 'Informe um e-mail válido' })
    @IsNotEmpty({ message: 'O e-mail de usuário é obrigatório' })
    @Column({ length: 255, nullable: false, unique: true }) // UNIQUE ADICIONADO AQUI
    @ApiProperty({ example: "contato@restaurante.com", description: 'E-mail usado para login' })
    usuario: string;

    @IsNotEmpty({ message: 'A senha é obrigatória' })
    @Column({ length: 255, nullable: false }) 
    @ApiProperty({ example: "senha123", description: 'A senha será criptografada antes de salvar' })
    senha: string;

    @IsOptional()
    @OneToMany(() => Produto, (produto) => produto.usuario)
    @Type(() => Produto)
    produtos: Produto[];
}