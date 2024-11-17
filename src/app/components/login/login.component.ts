import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../footer/footer.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators  } from '@angular/forms'; 
import { Router } from '@angular/router';

/**
 * @description
 * Componente login
 * 
 * Componente encargado de la vista de inicio de sesión de la aplicación
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NavbarComponent, FooterComponent,  ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  /**
   * Formulario de incio de sesión
   */
  login!: FormGroup;
  /**
   * Lista de usuarios obtenidos desde la variable de sesión
   */
  listaUsuarios: any[] = JSON.parse(sessionStorage.getItem('usuarios') || '[]');

  /**
   * @constructor
   * @param fb - Servicio de creación de formulario de Angular
   * @param router  - Servicio de enrutamiento de Angular
   */
  constructor (private fb: FormBuilder, private router:Router) {}

  /**
   * Metodo de inicialización del componente
   * Inicializa el formulario de login con sus validaciones correspondiente
   */
  ngOnInit(): void{
    this.login = this.fb.group({
      nombreUsuario: ['', Validators.required],
      contrasenaUsuario: ['', Validators.required]
    });
  
  }

  /**
   * Permite iniciar sesión en la aplicación
   * Verifica si el nombre de usuario y la constraseña corresponde a uno de los valores registrados en la
   * variable de sesión.
   * 
   * Adicionalmente en este caso, se dejo por defecto las credenciales de administración
   */
  iniciarSesion(){
    if(this.login.valid){
      const nombreUsuario = this.login.get('nombreUsuario')!.value;
      const contrasena = this.login.get('contrasenaUsuario')!.value;
      if(this.listaUsuarios){
        let usuarioLogeado = false;
        this.listaUsuarios.forEach(function (usuario){
          if(usuario.nombreUsuario == nombreUsuario){
            if(usuario.contrasena == contrasena){
              usuario.sesionIniciada = true;
              usuarioLogeado = true;
              
            }
          }
        });

        if(nombreUsuario == 'Administrador' && contrasena == '123.pass'){
          alert('Sesión como administrador!');
          this.router.navigate(['admin/inicio']);
        }else{
          if(usuarioLogeado){
            alert('Sesión iniciada!');
            sessionStorage.setItem('usuarios', JSON.stringify(this.listaUsuarios));
            this.router.navigate(['inicio']);
          }else{
            alert("El nombre de usuario o la contraseña es incorrecta");
          }
        }

      }else{
        if(nombreUsuario == 'Administrador' && contrasena == '123.pass'){
          alert('Sesión como administrador!');
          this.router.navigate(['inicio']);
        }else{
          alert("El nombre de usuario o la contraseña es incorrecta");
        }
        
      }

    }else{
      alert("Favor de completar los campos obligatorios");
    }
  }
}
