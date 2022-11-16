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
import {NOMEM} from 'dns';
import {request} from 'http';
import {keys} from '../configuracion/keys';
import {Credenciales, Persona} from '../models';
import {PersonaRepository} from '../repositories';
import { AutenticacionService }  from '../services';
const fetch = require("node-fetch");

export class PersonaController {
  constructor(
    @repository(PersonaRepository)
    public personaRepository : PersonaRepository,

    @service (AutenticacionService)
    public servicioAutenticacion: AutenticacionService

  ) {}

  @post('/registrese')
  @response(200, {
    description: 'Persona model instance',
    content: {'application/json': {schema: getModelSchemaRef(Persona)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {
            title: 'NewPersona',
            exclude: ['id'],
          }),
        },
      },
    })
    persona: Omit<Persona, 'id'>,
  ): Promise<Persona> {

    let clave = this.servicioAutenticacion.GenerarClave();
    let claveCifrada = this.servicioAutenticacion.Encriptar(clave);
    persona.clave = claveCifrada;

//Notificacion a traves del correo
    let destino = persona.correo;
    let asunto = "Acceso a la app Pedidos!!"
    let contenido = `Hola, ${persona.nombre}, su usuario para el acceso es: ${persona.correo} y su contraseña es: ${clave}`;

    fetch(`${keys.urlAutenticacion}/e-mail?destino=${destino}&asunto=${asunto}&contenido=${contenido}`)
    .then ((data:any) =>{
      console.log(data);
    });

    let p= await this.personaRepository.create(persona);

    return p;

    }

  @get('/personas/count')
  @response(200, {
    description: 'Persona model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.count(where);
  }

  @get('/personas')
  @response(200, {
    description: 'Array of Persona model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Persona, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Persona) filter?: Filter<Persona>,
  ): Promise<Persona[]> {
    return this.personaRepository.find(filter);
  }

  @patch('/personas')
  @response(200, {
    description: 'Persona PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.updateAll(persona, where);
  }

  @get('/personas/{id}')
  @response(200, {
    description: 'Persona model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Persona, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Persona, {exclude: 'where'}) filter?: FilterExcludingWhere<Persona>
  ): Promise<Persona> {
    return this.personaRepository.findById(id, filter);
  }

  @patch('/personas/{id}')
  @response(204, {
    description: 'Persona PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
  ): Promise<void> {
    await this.personaRepository.updateById(id, persona);
  }

  @put('/personas/{id}')
  @response(204, {
    description: 'Persona PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() persona: Persona,
  ): Promise<void> {
    await this.personaRepository.replaceById(id, persona);
  }

  @del('/personas/{id}')
  @response(204, {
    description: 'Persona DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.personaRepository.deleteById(id);
  }

  /**
   * Metodos propios
   */

  @post('/identificar-personas', {
    responses:{
      "200":{
        description: "Identificacaion de usuarios"
      }
    }
  })
  async identificar(
    @requestBody() credenciales: Credenciales
  ): Promise<Persona | null>{
    credenciales.password = this.servicioAutenticacion.Encriptar(credenciales.password);
    let persona = await this.personaRepository.findOne({
      where:{
        correo: credenciales.usuario,
        clave: credenciales.password
      }
    });
    return persona;
  }

  @post('/loginT')
  @response (200,{
    description: "Identificacion de usuario generando token"
  })
  async IdentificarToken(
    @requestBody() credenciales: Credenciales
  ){
    let p = await this.servicioAutenticacion.IdentificarPersona(credenciales);
    if (p) {
      let token = this.servicioAutenticacion.GeneracionToken(p);
      return {
        respuesta:{
          nombre: p.nombre
        },
        tk: token
      }
    }else{
      throw new HttpErrors [401] ("Datos invalidos");
    }
  }
}
