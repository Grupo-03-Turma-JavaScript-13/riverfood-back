import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsuarioService } from '../../usuario/service/usuario.service';
import { Bcrypt } from '../bcrypt/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsuarioLogin } from '../entities/usuariologin';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    private bcrypt: Bcrypt,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const buscaUsuario = await this.usuarioService.findByUsuario(username);

    if (!buscaUsuario)
      throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);

    const matchPassword = await this.bcrypt.compararSenhas(
      password,
      buscaUsuario.senha,
    );

    if (buscaUsuario && matchPassword) {
      const { senha, ...resposta } = buscaUsuario;
      return resposta;
    }

    return null;
  }
  async login(usuarioLogin: UsuarioLogin) {
  
    const buscaUsuario = await this.usuarioService.findByUsuario(
      usuarioLogin.usuario,
    );

    
    if (!buscaUsuario)
      throw new HttpException('Usuario não encontrado!', HttpStatus.NOT_FOUND);
    const payload = { sub: {id: buscaUsuario.id, usuario:buscaUsuario.usuario} };

    return {
      id: buscaUsuario.id,
      nome: buscaUsuario.nome,
      usuario: usuarioLogin.usuario,
      senha: '',
      token: `Bearer ${this.jwtService.sign(payload)}`,
    };
  }
}

