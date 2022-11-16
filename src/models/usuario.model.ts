import {Entity, model, property, hasMany} from '@loopback/repository';
import {Roles} from './roles.model';
import {Rolusuarios} from './rolusuarios.model';

@model()
export class Usuario extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  nombre: string;

  @property({
    type: 'string',
    required: true,
  })
  correo: string;

  @property({
    type: 'string',
    required: true,
  })
  celular: string;

  @property({
    type: 'string',
  })
  clave?: string;

  @property({
    type: 'string',
  })
  perfil?: string;

  @hasMany(() => Roles, {through: {model: () => Rolusuarios}})
  roles: Roles[];

  constructor(data?: Partial<Usuario>) {
    super(data);
  }
}

export interface UsuarioRelations {
  // describe navigational properties here
}

export type UsuarioWithRelations = Usuario & UsuarioRelations;
