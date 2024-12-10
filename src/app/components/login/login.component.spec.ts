import { TestBed, ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;
  let router: Router;

  const mockUsuarios = [
    {
      id: 1,
      nombreCompleto: 'Juan Pérez',
      nombreUsuario: 'jperez',
      correoUsuario: 'juan@example.com',
      direccionDespacho: 'Calle falsa 123',
      contrasena: 'Admin123',
      fechaNacimiento: '1990-01-01',
      sesionIniciada: false,
      rol: 'Usuario'
    },
    {
      id: 2,
      nombreCompleto: 'María Admin',
      nombreUsuario: 'madmin',
      correoUsuario: 'maria@example.com',
      direccionDespacho: 'Calle Real 456',
      contrasena: 'PassAdmin',
      fechaNacimiento: '1985-05-05',
      sesionIniciada: false,
      rol: 'Administrador'
    }
  ];

  beforeEach(async () => {
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['obtenerTodosLosUsuarios', 'actualizarUsuario']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        FormBuilder,
        { provide: UsuarioService, useValue: usuarioServiceSpy }
      ]
    }).overrideComponent(LoginComponent, {
      add: {
        providers: [
          { provide: UsuarioService, useValue: usuarioServiceSpy }
        ]
      }
    })
    .compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of(mockUsuarios));
    fixture.detectChanges(); // ngOnInit
  });

  it('should create the component and initialize the form', () => {
    expect(component).toBeTruthy();
    expect(component.login).toBeDefined();
    expect(usuarioServiceSpy.obtenerTodosLosUsuarios).toHaveBeenCalled();
    expect(component.listaUsuarios).toEqual(mockUsuarios);
  });

  it('should alert if form is invalid', () => {
    spyOn(window, 'alert');
    // Form inicialmente vacío y por ende inválido
    component.iniciarSesion();
    expect(window.alert).toHaveBeenCalledWith('Favor de completar los campos obligatorios');
  });

  it('should alert if no users list is available', () => {
    usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of([]));
    fixture.detectChanges(); // recarga y ahora listaUsuarios = []
    spyOn(window, 'alert');

    component.login.patchValue({
      nombreUsuario: 'noexiste',
      contrasenaUsuario: '1234'
    });
    component.iniciarSesion();
    expect(window.alert).toHaveBeenCalledWith('El nombre de usuario o la contraseña es incorrecta');
  });

  it('should alert if username does not exist', () => {
    spyOn(window, 'alert');
    component.login.patchValue({
      nombreUsuario: 'noexiste',
      contrasenaUsuario: '1234'
    });
    component.iniciarSesion();
    expect(window.alert).toHaveBeenCalledWith('El nombre de usuario o la contraseña es incorrecta');
  });

  it('should alert if password is incorrect', () => {
    spyOn(window, 'alert');
    component.login.patchValue({
      nombreUsuario: 'jperez', // Existe en mockUsuarios
      contrasenaUsuario: 'wrongpass'
    });
    component.iniciarSesion();
    expect(window.alert).toHaveBeenCalledWith('El nombre de usuario o la contraseña es incorrecta');
  });

  // it('should login a normal user and navigate to inicio', waitForAsync(() => {
  //   spyOn(window, 'alert');
  //   spyOn(router, 'navigate');
  //   usuarioServiceSpy.actualizarUsuario.and.returnValue(of(mockUsuarios[0]));

  //   component.login.patchValue({
  //     nombreUsuario: 'jperez',
  //     contrasenaUsuario: 'Admin123'
  //   });
  //   component.iniciarSesion();

  //   expect(window.alert).toHaveBeenCalledWith('Sesión iniciada');
  //   expect(usuarioServiceSpy.actualizarUsuario).toHaveBeenCalledWith(1, jasmine.objectContaining({ sesionIniciada: true }));
  //   fixture.whenStable().then(() => {
  //     expect(router.navigate).toHaveBeenCalledWith(['inicio']);
  //   });
  // }));

  // it('should login an admin user and navigate to admin/inicio', waitForAsync(() => {
  //   spyOn(window, 'alert');
  //   spyOn(router, 'navigate');
  //   usuarioServiceSpy.actualizarUsuario.and.returnValue(of(mockUsuarios[1]));

  //   component.login.patchValue({
  //     nombreUsuario: 'madmin',
  //     contrasenaUsuario: 'PassAdmin'
  //   });
  //   component.iniciarSesion();

  //   expect(window.alert).toHaveBeenCalledWith('Sesión iniciada');
  //   expect(usuarioServiceSpy.actualizarUsuario).toHaveBeenCalledWith(2, jasmine.objectContaining({ sesionIniciada: true }));
  //   fixture.whenStable().then(() => {
  //     expect(router.navigate).toHaveBeenCalledWith(['admin/inicio']);
  //   });
  // }));

  // it('should handle error when updating user after login', waitForAsync(() => {
  //   spyOn(window, 'alert');
  //   spyOn(console, 'error');
  //   spyOn(router, 'navigate');
  //   usuarioServiceSpy.actualizarUsuario.and.returnValue(throwError(() => 'Error Actualizando'));

  //   component.login.patchValue({
  //     nombreUsuario: 'jperez',
  //     contrasenaUsuario: 'Admin123'
  //   });
  //   component.iniciarSesion();

  //   expect(window.alert).toHaveBeenCalledWith('Sesión iniciada');
  //   fixture.whenStable().then(() => {
  //     expect(console.error).toHaveBeenCalledWith('Ocurrio un error al agregar un usuario:', 'Error Actualizando');
  //     // A pesar del error, debería navegar al rol correspondiente (Usuario = 'inicio')
  //     expect(router.navigate).toHaveBeenCalledWith(['inicio']);
  //   });
  // }));
});
