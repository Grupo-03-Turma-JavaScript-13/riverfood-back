import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaService } from './service/categoria.service';
import { CategoriaController } from './controller/categoria.controller';
import { Categoria } from './entities/categoria.entity';

@Module({
  imports: [
    // Registra a entidade para que o Repository possa ser injetado no Service
    TypeOrmModule.forFeature([Categoria])
  ],
  controllers: [CategoriaController],
  providers: [CategoriaService],
  // Exportamos o Service para que o ProdutoModule possa validar categorias
  exports: [CategoriaService] 
})
export class CategoriaModule {}