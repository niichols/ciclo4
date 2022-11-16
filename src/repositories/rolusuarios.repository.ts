import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Rolusuarios, RolusuariosRelations} from '../models';

export class RolusuariosRepository extends DefaultCrudRepository<
  Rolusuarios,
  typeof Rolusuarios.prototype.id,
  RolusuariosRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Rolusuarios, dataSource);
  }
}
