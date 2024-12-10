import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RecuperarContrasenaComponent } from './recuperar-contrasena.component';
import { UsuarioService } from '../../services/usuario.service';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('RecuperarContrasenaComponent', () => {
  let component: RecuperarContrasenaComponent;
  let fixture: ComponentFixture<RecuperarContrasenaComponent>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;

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
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['obtenerTodosLosUsuarios']);

    await TestBed.configureTestingModule({
      imports: [RecuperarContrasenaComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        FormBuilder,
        { provide: UsuarioService, useValue: usuarioServiceSpy }
      ]
    }).overrideComponent(RecuperarContrasenaComponent, {
      add: {
        providers: [
          { provide: UsuarioService, useValue: usuarioServiceSpy }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecuperarContrasenaComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of(mockUsuarios));
    fixture.detectChanges(); // ngOnInit
  });

  it('should create the component and initialize the form', () => {
    expect(component).toBeTruthy();
    expect(component.recuperarCorreo).toBeDefined();
    expect(usuarioServiceSpy.obtenerTodosLosUsuarios).toHaveBeenCalled();
    expect(component.listaUsuarios).toEqual(mockUsuarios);
  });

  it('should do nothing if form is invalid (no input)', () => {
    spyOn(window, 'alert');
    // Form vacío => inválido
    component.recuperarContrasena();
    // No debería llamar alert, ya que no entra en el if (aunque el código no muestra alert para form inválido, no hace nada)
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('should do nothing if form is invalid (invalid email)', () => {
    spyOn(window, 'alert');
    component.recuperarCorreo.patchValue({
      correoValidacion: 'notAnEmail'
    });
    component.recuperarContrasena();
    // Form inválido por ser un email inválido
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('should alert if email not found in users list', () => {
    spyOn(window, 'alert');
    component.recuperarCorreo.patchValue({
      correoValidacion: 'noexiste@example.com'
    });
    component.recuperarContrasena();
    expect(window.alert).toHaveBeenCalledWith('El correo ingresado no existe');
  });

  it('should alert if user list is empty', () => {
    usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of([]));
    fixture.detectChanges();

    spyOn(window, 'alert');
    component.recuperarCorreo.patchValue({
      correoValidacion: 'juan@example.com'
    });
    component.recuperarContrasena();

    expect(window.alert).toHaveBeenCalledWith('El correo ingresado no existe');
  });

  it('should alert the user password if email is found', () => {
    spyOn(window, 'alert');
    component.recuperarCorreo.patchValue({
      correoValidacion: 'juan@example.com'
    });
    component.recuperarContrasena();

    // juan@example.com existe con contrasena 'Admin123'
    expect(window.alert).toHaveBeenCalledWith('Su Contraseña es: Admin123');
  });

  it('should alert if user with given email not found in a non-empty list', () => {
    spyOn(window, 'alert');
    component.recuperarCorreo.patchValue({
      correoValidacion: 'notfound@example.com'
    });
    component.recuperarContrasena();
    expect(window.alert).toHaveBeenCalledWith('El correo ingresado no existe');
  });
});
