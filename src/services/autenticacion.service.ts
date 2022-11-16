import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {keys} from '../configuracion/keys';
import {Credenciales, Persona, Roles, Usuario} from '../models';
import {PersonaRepository, UsuarioRepository} from '../repositories';
const generador = require("generate-password");
const cryptoJS = require("crypto-js");
const JWT = require("jsonwebtoken");

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(/* Add @inject to inject parameters */
    @repository(PersonaRepository)
    public repositorioPersona: PersonaRepository,

    @repository(UsuarioRepository)
    public usuarioRepo: UsuarioRepository

  ) {}

  /*
   * Add service methods here
   */

  GenerarClave() {
    let password = generador.generate({
      length: 8,
      numbers: true
    });
    return password;

  }

  Encriptar(password: string) {
    let passCifrado = cryptoJS.MD5(password).toString();
    return passCifrado;
  }

  IdentificarPersona(credenciales: Credenciales) {
    try {
      // credenciales.password = this.Encriptar(credenciales.password);
      let p = this.usuarioRepo.findOne({
        where: {
          correo: credenciales.usuario,
          clave: credenciales.password
        }, include: ['roles']
      });
      return p;
    } catch {
      return false;
    }

  }

  GeneracionToken(usuario: Usuario) {
    if (usuario.roles != null){
      let x = usuario.roles
      let token = JWT.sign({
        data: {
          id: usuario.id,
          correo: usuario.correo,
          nombre: usuario.nombre,
          //rol: usuario.roles
          rol: x
        }
      },
        keys.LlaveJWT);
        return token;
    }else{
      let z:any = []
      let token = JWT.sign({
        data: {
          id: usuario.id,
          correo: usuario.correo,
          nombre: usuario.nombre,
          //rol: usuario.roles
          rol: z
    }
  },
  keys.LlaveJWT);

 }
}

  Validartoken(token: string) {
    try {
      let datos = JWT.verify(token, keys.LlaveJWT);
      return datos;
    } catch {
      return false;
    }
  }
}
