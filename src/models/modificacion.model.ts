import {Model, model, property} from '@loopback/repository';

@model()
export class Modificacion extends Model {
  @property({
    type: 'string',
    required: true,
  })
  panterior: string;

  @property({
    type: 'string',
    required: true,
  })
  pnuevo: string;

  @property({
    type: 'string',
    required: true,
  })
  pvalidado: string;


  constructor(data?: Partial<Modificacion>) {
    super(data);
  }
}

export interface ModificacionRelations {
  // describe navigational properties here
}

export type ModificacionWithRelations = Modificacion & ModificacionRelations;
