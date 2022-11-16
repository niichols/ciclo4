import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {hasUncaughtExceptionCaptureCallback} from 'process';
import {Credenciales, Usuario} from '../models';
import {Modificacion} from '../models/modificacion.model';
import {PersonaRepository, UsuarioRepository} from '../repositories';
import {AutenticacionService} from '../services';
const fetch = require ("node-fetch");

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository : UsuarioRepository,
    @service (AutenticacionService)
    public servicioAutenticacion: AutenticacionService,
    @repository (PersonaRepository)
    public personaRepo: PersonaRepository

  ) {}

  @post('/Registrese')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, 'id'>,
  ): Promise<Usuario> {
    let clave = this.servicioAutenticacion.GenerarClave();
    let claveCifrada = this.servicioAutenticacion.Encriptar(clave);
    usuario.clave = claveCifrada;
    let user = await this.usuarioRepository.create(usuario);

    if (usuario.perfil == "persona"){
      let p = await this.personaRepo.create(usuario);

    }
    return user;

    /** Implementacion de la notificacion a traves del correo */
  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }

  /**
   * Procesos propios
   */

  @post('/Login')
  @response (200,{
    description: "Ingreso de usuarios de la app"
  })
  async identificar(
    @requestBody () credenciales: Credenciales
  ){
    let user = await this.servicioAutenticacion.IdentificarPersona(credenciales);
    if (user) {
      let token = this.servicioAutenticacion.GeneracionToken(user);
      return {
        info: {
          nombre: user.nombre
        },
        tk: token
      }
    }else{
      throw new HttpErrors[401] ("Usuario o contraseña invalido ");

    }
  }

  @post('/recuperar-Pass')
  @response (200, {
    description: "Recuperacion de contraseña para el usuario"
  })
  async recuperarPass (
    @requestBody () email:string
  ) : Promise <Boolean> {
      let user = await this.usuarioRepository.findOne ({
        where: {
          correo: email
        }
      });
      if (user){
        let clave = this.servicioAutenticacion.GenerarClave();
        let claveCifrada = this.servicioAutenticacion.Encriptar(clave);
        user.clave = claveCifrada;
        await this.usuarioRepository.updateById(user.id, user);

        /** Notificacion al correo */
        let destino = user.correo;
        let asunto = "Recuperacion de contraseña de la APP-PEDIDOS"
        let mensaje = `Hola, ${user.nombre}, Usted ha solicitado recuperar la contraseña,
        su nueva contraseña es: ${clave}`;

        fetch(`http://localhost:5000/e-mail? email_destino = ${destino} & asunto = ${asunto} & mensaje = ${mensaje}`).
        then ((data:any) => {
          console.log (data)

        });
        return true;

      } else {
        return false;
      }
  }

  @post ('/Modificar-Pass')
  @response (200, {
    description: "Modificacion de contraseña por parte del usuario"
  })
  async modificarPass(
    @requestBody() datos: Modificacion
  ): Promise<Boolean> {
    let cifrada = this.servicioAutenticacion.Encriptar(datos.panterior);
    let user = await this.usuarioRepository.findOne({
      where:{
        clave:cifrada
      }
    });
    if (user) {
      if (datos.pnuevo == datos.pvalidado){
        user.clave = this.servicioAutenticacion.Encriptar(datos.pnuevo);
        await this.usuarioRepository.updateById(user.id, user);

        /** Notificacion */

        let destino = user.correo;
        let asunto = "Modificacion de contraseña de la APP-PEDIDOS"
        let mensaje = `Hola, ${user.nombre}, Usted ha realizadado una modificacion de la contraseña,
        su nueva contraseña es: ${datos.pnuevo}`;

        fetch(`http://localhost:5000/e-mail? email_destino = ${destino} & asunto = ${asunto} & mensaje = ${mensaje}`).
        then ((data:any) => {
          console.log (data)

        });

        return true;
      } else {
        console.log ("Las contraseñas no coinciden")
        return false;
      }

    } else {
      return false;
    }
  }
}
