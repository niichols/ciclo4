import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Usuario, UsuarioRelations, Roles, Rolusuarios} from '../models';
import {RolusuariosRepository} from './rolusuarios.repository';
import {RolesRepository} from './roles.repository';

export class UsuarioRepository extends DefaultCrudRepository<
  Usuario,
  typeof Usuario.prototype.id,
  UsuarioRelations
> {

  public readonly roles: HasManyThroughRepositoryFactory<Roles, typeof Roles.prototype.id,
          Rolusuarios,
          typeof Usuario.prototype.id
        >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('RolusuariosRepository') protected rolusuariosRepositoryGetter: Getter<RolusuariosRepository>, @repository.getter('RolesRepository') protected rolesRepositoryGetter: Getter<RolesRepository>,
  ) {
    super(Usuario, dataSource);
    this.roles = this.createHasManyThroughRepositoryFactoryFor('roles', rolesRepositoryGetter, rolusuariosRepositoryGetter,);
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);
  }
}
