import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './categoria/entities/categoria.entity';
import { Produto } from './produto/entities/produto.entity';
import { Usuario } from './usuario/entities/usuario.entity';
import { ProdutoModule } from './produto/produto.module';
import { CategoriaModule } from './categoria/categoria.module';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forRoot({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: true,
        entities: [Categoria, Produto, Usuario],
        autoLoadEntities: false,
        synchronize: false,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
          // Configurações otimizadas para Neon
          max: 1,
          connectionTimeoutMillis: 0,
          idleTimeoutMillis: 30000,
        },
        logging: true,
      }),
      ProdutoModule,
      CategoriaModule,
      AuthModule,
      UsuarioModule,
    ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
