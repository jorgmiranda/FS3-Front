import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * @description
 * Componente de encabezado y barra de navegación para la sección de administración
 * 
 * Este componentne muestra el encabezado y barra de navegación para los usuarios administradores.
 *
 * @usageNotes
 * 1. Importa este componente en los compoentes relacionados a la vista del administrador
 * 2. Añade el selector ´app-navbaradmin para mostrar el encabezado
 */
@Component({
  selector: 'app-navbaradmin',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './navbaradmin.component.html',
  styleUrl: './navbaradmin.component.scss'
})
/**
 * Navbar Admin component
 */
export class NavbaradminComponent {

  /**
   * @constructor
   * @param router - Servicio de enrutamiento de Angular
   */
  constructor(private router:Router) { }


  /**
   * Cierra la sesión del administrador y regresa a la pagina de inicio
   */
  apagarSesionAdmin(){
      alert("Se ha cerrado la sesion");
      this.router.navigate(['inicio']);
  }

}
