import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarPerfilComponent } from './editar-perfil.component';
import { UsuarioService } from '../../../services/usuario.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Usuario } from '../../../model/usuario';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('EditarPerfilComponent', () => {
  let component: EditarPerfilComponent;
  let fixture: ComponentFixture<EditarPerfilComponent>;
  let mockUsuarioService: jasmine.SpyObj<UsuarioService>;

  const mockUsuarios: Usuario[] = [
    {
      id: 1,
      nombreUsuario: 'testuser',
      nombreCompleto: 'Test User',
      correoUsuario: 'test@example.com',
      fechaNacimiento: '2000-01-01',
      contrasena: 'Password123',
      direccionDespacho: 'Test Address',
      sesionIniciada: true,
      rol: 'Usuario'
    },
    {
      id: 2,
      nombreUsuario: 'otheruser',
      nombreCompleto: 'Other User',
      correoUsuario: 'other@example.com',
      fechaNacimiento: '2010-01-01',
      contrasena: 'OtherPass123',
      direccionDespacho: 'Other Address',
      sesionIniciada: false,
      rol: 'Usuario'
    },
  ];

  beforeEach(async () => {
    mockUsuarioService = jasmine.createSpyObj('UsuarioService', [
      'obtenerTodosLosUsuarios',
      'actualizarUsuario',
    ]);

    await TestBed.configureTestingModule({
      imports: [EditarPerfilComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: UsuarioService, useValue: mockUsuarioService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => null }), // Mock de `ActivatedRoute`
          },
        },
      ],
    }).overrideComponent(EditarPerfilComponent, {
      add: {
        providers: [
          { provide: UsuarioService, useValue: mockUsuarioService }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPerfilComponent);
    component = fixture.componentInstance;

    mockUsuarioService.obtenerTodosLosUsuarios.and.returnValue(of(mockUsuarios));
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with logged-in user data', () => {
    component.ngOnInit();
    expect(component.usuariologeado).toEqual(mockUsuarios[0]);
    expect(component.updateForm).toBeDefined();
    expect(component.updateForm.get('nombreCompleto')?.value).toEqual('Test User');
  });

  it('should validate user age correctly', () => {
    const control = { value: '2015-01-01' };
    const result = component.validarEdad(control as any);
    expect(result).toEqual({ menorDeEdad: true });

    const validControl = { value: '2000-01-01' };
    const validResult = component.validarEdad(validControl as any);
    expect(validResult).toBeNull();
  });

  it('should calculate age correctly', () => {
    const edad = component.calcularEdad(new Date('2000-01-01'));
    expect(edad).toBeGreaterThan(20);
  });

  it('should validate matching passwords', () => {
    const formGroup = component.fb.group({
      contrasenaUsuario1: 'Password123',
      contrasenaUsuario2: 'Password123',
    });

    const result = component.validarContrasenasIguales(formGroup);
    expect(result).toBeNull();

    formGroup.get('contrasenaUsuario2')?.setValue('DifferentPassword');
    const mismatchResult = component.validarContrasenasIguales(formGroup);
    expect(mismatchResult).toEqual({ contrasenasNoCoinciden: true });
  });

  it('should validate password format', () => {
    const validatorFn = component.validarContrasenaFormato();
    let control = { value: 'Pass1' } as any;
    expect(validatorFn(control)).toEqual({ contrasenaInvalida: true });

    control = { value: 'Password123' } as any;
    expect(validatorFn(control)).toBeNull();
  });

  it('should update user when form is valid', () => {
    component.ngOnInit();
    component.updateForm.setValue({
      nombreCompleto: 'Updated User',
      correoUsuario: 'updated@example.com',
      fechaNacimientoUsuario: '1990-01-01',
      contrasenaUsuario1: 'UpdatedPassword123',
      contrasenaUsuario2: 'UpdatedPassword123',
      direccionDespacho: 'Updated Address',
    });

    mockUsuarioService.actualizarUsuario.and.returnValue(of(mockUsuarios[0]));
    component.actualizarUsuario();

    expect(mockUsuarioService.actualizarUsuario).toHaveBeenCalledWith(1, {
      ...mockUsuarios[0],
      nombreCompleto: 'Updated User',
      correoUsuario: 'updated@example.com',
      fechaNacimiento: '1990-01-01',
      contrasena: 'UpdatedPassword123',
      direccionDespacho: 'Updated Address',
    });
  });

  it('should not update user if form is invalid', () => {
    spyOn(window, 'alert');
    component.updateForm.setValue({
      nombreCompleto: '',
      correoUsuario: '',
      fechaNacimientoUsuario: '',
      contrasenaUsuario1: '',
      contrasenaUsuario2: '',
      direccionDespacho: '',
    });

    component.actualizarUsuario();
    expect(window.alert).toHaveBeenCalledWith('Favor de ingregar los campos obligatorios');
    expect(mockUsuarioService.actualizarUsuario).not.toHaveBeenCalled();
  });
});
