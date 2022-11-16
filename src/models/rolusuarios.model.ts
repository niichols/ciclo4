import {Entity, model, property} from '@loopback/repository';

@model()
export class Rolusuarios extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  usuarioId?: string;

  @property({
    type: 'string',
  })
  rolesId?: string;

  constructor(data?: Partial<Rolusuarios>) {
    super(data);
  }
}

export interface RolusuariosRelations {
  // describe navigational properties here
}

export type RolusuariosWithRelations = Rolusuarios & RolusuariosRelations;
