import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaUsuariosComponent } from './lista-usuarios.component';
import { UsuarioService } from '../../../services/usuario.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Usuario } from '../../../model/usuario'; 
import { RouterTestingModule } from '@angular/router/testing';

describe('ListaUsuariosComponent', () => {
  let component: ListaUsuariosComponent;
  let fixture: ComponentFixture<ListaUsuariosComponent>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;

  const mockUsuarios: Usuario[] = [
    {
      id: 1,
      nombreCompleto: 'Juan Pérez',
      nombreUsuario: 'jperez',
      correoUsuario: 'juan@example.com',
      direccionDespacho: 'Calle Falsa 123',
      contrasena: 'Admin123',
      fechaNacimiento: '2000-01-01',
      sesionIniciada: false,
      rol: 'Usuario'
    },
    {
      id: 2,
      nombreCompleto: 'María Gómez',
      nombreUsuario: 'mgomez',
      correoUsuario: 'maria@example.com',
      direccionDespacho: 'Calle Real 456',
      contrasena: 'Pass1234',
      fechaNacimiento: '1990-05-05',
      sesionIniciada: false,
      rol: 'Administrador'
    }
  ];

  beforeEach(async () => {
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', [
      'obtenerTodosLosUsuarios', 'actualizarUsuario', 'agregarUsuario', 'eliminarUsuario'
    ]);
  
    await TestBed.configureTestingModule({
      imports: [
        ListaUsuariosComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule // <-- Importar el RouterTestingModule
      ],
      providers: [
        { provide: UsuarioService, useValue: usuarioServiceSpy }
      ]
    }).overrideComponent(ListaUsuariosComponent, {
      add: {
        providers: [
          { provide: UsuarioService, useValue: usuarioServiceSpy }
        ]
      }
    })
    .compileComponents();
  
    fixture = TestBed.createComponent(ListaUsuariosComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of(mockUsuarios));
    fixture.detectChanges(); // ngOnInit se dispara aquí
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call obtenerTodosLosUsuarios on init and set usuarios', () => {
    expect(usuarioServiceSpy.obtenerTodosLosUsuarios).toHaveBeenCalled();
    expect(component.usuarios).toEqual(mockUsuarios);
  });

  it('should initialize the form correctly', () => {
    expect(component.mantenedorForm).toBeDefined();
    expect(component.mantenedorForm.get('nombreCompleto')).toBeTruthy();
  });

  it('should validate edad correctly (menor de edad)', () => {
    const control = { value: '2020-01-01' }; // Menos de 13 años
    const result = component.validarEdad(control);
    expect(result).toEqual({ menorDeEdad: true });
  });

  it('should validate edad correctly (mayor de edad)', () => {
    const control = { value: '2000-01-01' }; // Mayor de 13 años
    const result = component.validarEdad(control);
    expect(result).toBeNull();
  });

  it('should validate contraseñas iguales (no coinciden)', () => {
    const formGroup = component.fb.group({
      contrasenaUsuario1: ['Admin123'],
      contrasenaUsuario2: ['Admin124']
    });
    const result = component.validarContrasenasIguales(formGroup);
    expect(result).toEqual({ contrasenasNoCoinciden: true });
  });

  it('should validate contraseñas iguales (coinciden)', () => {
    const formGroup = component.fb.group({
      contrasenaUsuario1: ['Admin123'],
      contrasenaUsuario2: ['Admin123']
    });
    const result = component.validarContrasenasIguales(formGroup);
    expect(result).toBeNull();
  });

  it('should validate password format correctly (invalida)', () => {
    const validator = component.validarContrasenaFormato();
    const control = { value: 'abc' } as any;
    const result = validator(control);
    expect(result).toEqual({ contrasenaInvalida: true });
  });

  it('should validate password format correctly (valida)', () => {
    const validator = component.validarContrasenaFormato();
    const control = { value: 'Abc123' } as any;
    const result = validator(control);
    expect(result).toBeNull();
  });

  it('should open modal for edit and patch values', () => {
    spyOn(component.modalInstance, 'show');
    component.abrirModal(mockUsuarios[0]);
    expect(component.modalTitle).toBe('Modificar usuario');
    expect(component.editingId).toBe(1);
    expect(component.mantenedorForm.get('nombreCompleto')?.value).toBe('Juan Pérez');
    expect(component.modalInstance.show).toHaveBeenCalled();
  });

  it('should open modal for create and reset form', () => {
    spyOn(component.modalInstance, 'show');
    component.abrirModal();
    expect(component.modalTitle).toBe('Agregar usuario');
    expect(component.editingId).toBeNull();
    // Se asegura que el formulario se ha reseteado. 
    expect(component.mantenedorForm.get('nombreCompleto')?.value).toBeNull();
    expect(component.modalInstance.show).toHaveBeenCalled();
  });

  it('should submit form and update existing user', () => {
    spyOn(component.modalInstance, 'hide');
    usuarioServiceSpy.actualizarUsuario.and.returnValue(of(mockUsuarios[0]));

    component.editingId = 1;
    component.mantenedorForm.patchValue({
      nombreCompleto: 'Juan Modificado',
      nombreUsuario: 'jmod',
      correoUsuario: 'juan.mod@example.com',
      fechaNacimiento: '2000-01-01',
      contrasenaUsuario1: 'Admin123',
      contrasenaUsuario2: 'Admin123',
      rol: 'Usuario',
      direccionDespacho: 'Nueva Direccion'
    });

    component.submitForm();
    expect(usuarioServiceSpy.actualizarUsuario).toHaveBeenCalled();
    expect(component.modalInstance.hide).toHaveBeenCalled();
  });

  it('should submit form and add new user', () => {
    // Mock modalInstance para evitar problemas con Bootstrap
    component.modalInstance = {
      show: jasmine.createSpy('show'),
      hide: jasmine.createSpy('hide')
    };
  
    usuarioServiceSpy.agregarUsuario.and.returnValue(of({
      ...mockUsuarios[0],
      id: 3,
      nombreCompleto: 'Nuevo Usuario'
    }));
  
    component.editingId = null;
    component.mantenedorForm.patchValue({
      nombreCompleto: 'Nuevo Usuario',
      nombreUsuario: 'nusuario',
      correoUsuario: 'nuevo@example.com',
      fechaNacimiento: '2000-01-01', // mayor de 13 años
      contrasenaUsuario1: 'Admin123', // cumple formato
      contrasenaUsuario2: 'Admin123', // coincide con contrasenaUsuario1
      rol: 'Administrador',           // valor válido
      direccionDespacho: 'Dir nueva'
    });
  
    // Forzar actualización del estado del formulario
    component.mantenedorForm.updateValueAndValidity();
    expect(component.mantenedorForm.valid).toBeTrue(); // confirmar que ahora es válido
  
    component.submitForm();
  
    expect(usuarioServiceSpy.agregarUsuario).toHaveBeenCalled();
    expect(component.modalInstance.hide).toHaveBeenCalled();
  });

  it('should show alert if form invalid on submit', () => {
    spyOn(window, 'alert');
    component.mantenedorForm.patchValue({
      // Dejamos campos requeridos vacíos para invalidar el form
      nombreCompleto: '',
      nombreUsuario: '',
      correoUsuario: '',
      fechaNacimiento: '',
      contrasenaUsuario1: '',
      contrasenaUsuario2: '',
      rol: 'Usuario'
    });
    component.submitForm();
    expect(window.alert).toHaveBeenCalledWith('Favor de ingresar los campos obligatorios');
  });

  it('should handle error on user update in submitForm', () => {
    spyOn(console, 'error');
    usuarioServiceSpy.actualizarUsuario.and.returnValue(throwError(() => 'Error Actualizando'));

    component.editingId = 1;
    component.mantenedorForm.patchValue({
      nombreCompleto: 'Error Update',
      nombreUsuario: 'erroruser',
      correoUsuario: 'error@example.com',
      fechaNacimiento: '2000-01-01',
      contrasenaUsuario1: 'Admin123',
      contrasenaUsuario2: 'Admin123',
      rol: 'Usuario',
      direccionDespacho: 'X'
    });

    component.submitForm();
    expect(console.error).toHaveBeenCalledWith('Ocurrio un error al editar un usuario:', 'Error Actualizando');
  });

  it('should handle error on user add in submitForm', () => {
    spyOn(console, 'error');
    usuarioServiceSpy.agregarUsuario.and.returnValue(throwError(() => 'Error Agregando'));

    component.editingId = null;
    component.mantenedorForm.patchValue({
      nombreCompleto: 'Error Add',
      nombreUsuario: 'erroradd',
      correoUsuario: 'erroradd@example.com',
      fechaNacimiento: '2000-01-01',
      contrasenaUsuario1: 'Admin123',
      contrasenaUsuario2: 'Admin123',
      rol: 'Usuario',
      direccionDespacho: 'X'
    });

    component.submitForm();
    expect(console.error).toHaveBeenCalledWith('Ocurrio un error al agregar un usuario:', 'Error Agregando');
  });

  it('should delete a user successfully', () => {
    spyOn(window, 'alert');
    usuarioServiceSpy.eliminarUsuario.and.returnValue(of(undefined));
    component.eliminar(mockUsuarios[0]);
    expect(usuarioServiceSpy.eliminarUsuario).toHaveBeenCalledWith(1);
    expect(window.alert).toHaveBeenCalledWith('Usuario Eliminado Exitosamente');
  });

  it('should handle error on delete', () => {
    spyOn(console, 'error');
    usuarioServiceSpy.eliminarUsuario.and.returnValue(throwError(() => 'Error Eliminando'));
    component.eliminar(mockUsuarios[0]);
    expect(console.error).toHaveBeenCalledWith('Ocurrio un error al eliminar un usuario:', 'Error Eliminando');
  });

  it('should alert if user not found to delete', () => {
    spyOn(window, 'alert');
    component.eliminar({ ...mockUsuarios[0], id: 999 }); // un id que no existe
    expect(window.alert).toHaveBeenCalledWith('El elemento de la lista no existe');
  });
});
