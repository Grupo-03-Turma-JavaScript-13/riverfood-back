import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './../entities/usuario.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository, Not } from 'typeorm';
import { Bcrypt } from '../../auth/bcrypt/bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private bcrypt: Bcrypt,
  ) {}

  async findAll(): Promise<Omit<Usuario, 'senha'>[]> {
    const usuarios = await this.usuarioRepository.find({
      relations: { produtos: true },
    });
    return usuarios.map(({ senha, ...usuarioSemSenha }) => usuarioSemSenha);
  }

  async findByUsuario(usuario: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({
      where: { usuario },
      relations: { produtos: true },
    });
  }

  async findById(id: number): Promise<Omit<Usuario, 'senha'>> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: { produtos: true },
    });

    if (!usuario)
      throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);

    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }

  // CREATE continua igual, pois no cadastro o usuário ainda não tem token
  async create(usuario: Usuario): Promise<Omit<Usuario, 'senha'>> {
    const buscaUsuario = await this.findByUsuario(usuario.usuario);

    if (buscaUsuario)
      throw new HttpException('O e-mail informado já está cadastrado!', HttpStatus.BAD_REQUEST);

    usuario.senha = await this.bcrypt.criptografarSenha(usuario.senha);

    const { id, ...usuarioNovo } = usuario;
    const salvo = await this.usuarioRepository.save(usuarioNovo);

    const { senha, ...usuarioSeguro } = salvo;
    return usuarioSeguro;
  }

  // UPDATE BLINDADO: Agora exige saber quem está logado
  async update(usuario: Usuario, usuarioLogadoId: number): Promise<Omit<Usuario, 'senha'>> {
    // 1. BLINDAGEM ANTI-IDOR (A regra que você percebeu que faltava)
    if (usuario.id !== usuarioLogadoId) {
      throw new HttpException(
        'Acesso Negado: Você só tem permissão para atualizar o seu próprio perfil.',
        HttpStatus.FORBIDDEN,
      );
    }

    // 2. Verificação se o usuário realmente existe no banco (para pegar a senha antiga)
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: { id: usuarioLogadoId }, // Usamos o ID do token para garantir
    });

    if (!usuarioExistente) {
      throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    // 3. Verificação de E-mail duplicado
    const buscaEmail = await this.usuarioRepository.findOne({
      where: {
        usuario: usuario.usuario,
        id: Not(usuarioLogadoId), // Só me importo se o e-mail for de OUTRO id
      },
    });

    if (buscaEmail) {
      throw new HttpException('O e-mail informado já está em uso por outra conta!', HttpStatus.BAD_REQUEST);
    }

    // 4. Verificação da Senha
    if (usuario.senha && usuario.senha.trim() !== '') {
      usuario.senha = await this.bcrypt.criptografarSenha(usuario.senha);
    } else {
      usuario.senha = usuarioExistente.senha;
    }

    // 5. Força o ID do payload a ser o ID do token antes de salvar (garantia extra)
    usuario.id = usuarioLogadoId;

    const atualizado = await this.usuarioRepository.save(usuario);
    const { senha, ...usuarioSeguro } = atualizado;

    return usuarioSeguro;
  }
}