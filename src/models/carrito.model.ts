import {Entity, model, property} from '@loopback/repository';

@model()
export class Carrito extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;


  constructor(data?: Partial<Carrito>) {
    super(data);
  }
}

export interface CarritoRelations {
  // describe navigational properties here
}

export type CarritoWithRelations = Carrito & CarritoRelations;
