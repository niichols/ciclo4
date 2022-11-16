import {AuthenticationStrategy} from "@loopback/authentication";
import {service} from '@loopback/core';

import {Request, RedirectRoute, HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {BlobOptions} from 'buffer';
import {ParamsDictionary} from 'express-serve-static-core';
import parseBearerToken from 'parse-bearer-token';
import {ParsedQs} from 'qs';
import {RolUsuarioController} from '../controllers';
import {Roles} from '../models';
import {AutenticacionService} from '../services';

var respuesta: Boolean = false;

export class estrategiaConfig implements AuthenticationStrategy {
  name: string = "config";

  constructor(
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService
  ) { }

  async authenticate(request: Request): Promise <UserProfile | undefined> {
    let token = parseBearerToken(request);
    if (token){
      let datos = this.servicioAutenticacion.Validartoken(token);
      if (datos){
        if (datos.data.rol){
          datos.data.rol.forEach(function (rol:any) {
            console.log ("Este es el rol : " + rol.nombre);
            if (rol.nombre == "Configurador"){
              respuesta = true;

            }

          });
          if(respuesta) {
            var perfil: UserProfile = Object.assign ({
              nombre: datos.data.nombre
            });
            return perfil;

          } else {
            throw new HttpErrors [401] ("No es configurador por lo tanto no tiene permiso a este recurso")

          }

        } else {
          throw new HttpErrors [401] ("Usted es un usuario de tipo cliente, sin autorizacion para este recurso");
        }

      } else {
        throw new HttpErrors [401] ("Tiene un token, pero no es valido");
      }

  } else {
    throw new HttpErrors[401] ("no hay un token en la solicitud")
  }
  }

}
