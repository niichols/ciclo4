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
} from '@loopback/rest';
import {Rolusuarios} from '../models';
import {RolusuariosRepository} from '../repositories';

export class RolUsuarioController {
  constructor(
    @repository(RolusuariosRepository)
    public rolusuariosRepository : RolusuariosRepository,
  ) {}

  @post('/rolusuarios')
  @response(200, {
    description: 'Rolusuarios model instance',
    content: {'application/json': {schema: getModelSchemaRef(Rolusuarios)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rolusuarios, {
            title: 'NewRolusuarios',
            exclude: ['id'],
          }),
        },
      },
    })
    rolusuarios: Omit<Rolusuarios, 'id'>,
  ): Promise<Rolusuarios> {
    return this.rolusuariosRepository.create(rolusuarios);
  }

  @get('/rolusuarios/count')
  @response(200, {
    description: 'Rolusuarios model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Rolusuarios) where?: Where<Rolusuarios>,
  ): Promise<Count> {
    return this.rolusuariosRepository.count(where);
  }

  @get('/rolusuarios')
  @response(200, {
    description: 'Array of Rolusuarios model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Rolusuarios, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Rolusuarios) filter?: Filter<Rolusuarios>,
  ): Promise<Rolusuarios[]> {
    return this.rolusuariosRepository.find(filter);
  }

  @patch('/rolusuarios')
  @response(200, {
    description: 'Rolusuarios PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rolusuarios, {partial: true}),
        },
      },
    })
    rolusuarios: Rolusuarios,
    @param.where(Rolusuarios) where?: Where<Rolusuarios>,
  ): Promise<Count> {
    return this.rolusuariosRepository.updateAll(rolusuarios, where);
  }

  @get('/rolusuarios/{id}')
  @response(200, {
    description: 'Rolusuarios model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Rolusuarios, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Rolusuarios, {exclude: 'where'}) filter?: FilterExcludingWhere<Rolusuarios>
  ): Promise<Rolusuarios> {
    return this.rolusuariosRepository.findById(id, filter);
  }

  @patch('/rolusuarios/{id}')
  @response(204, {
    description: 'Rolusuarios PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rolusuarios, {partial: true}),
        },
      },
    })
    rolusuarios: Rolusuarios,
  ): Promise<void> {
    await this.rolusuariosRepository.updateById(id, rolusuarios);
  }

  @put('/rolusuarios/{id}')
  @response(204, {
    description: 'Rolusuarios PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() rolusuarios: Rolusuarios,
  ): Promise<void> {
    await this.rolusuariosRepository.replaceById(id, rolusuarios);
  }

  @del('/rolusuarios/{id}')
  @response(204, {
    description: 'Rolusuarios DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.rolusuariosRepository.deleteById(id);
  }
}
