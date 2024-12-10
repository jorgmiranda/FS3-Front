import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NavbaradminComponent } from './navbaradmin.component';
import { UsuarioService } from '../../../services/usuario.service';
import { of, throwError } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('NavbaradminComponent', () => {
  let component: NavbaradminComponent;
  let fixture: ComponentFixture<NavbaradminComponent>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;
  let router: Router;

  const mockUsuarios = [
    {
      id: 1,
      nombreCompleto: 'Juan Pérez',
      nombreUsuario: 'jperez',
      correoUsuario: 'juan@example.com',
      direccionDespacho: 'Calle Falsa 123',
      contrasena: 'Admin123',
      fechaNacimiento: '2000-01-01',
      sesionIniciada: false,
      rol: 'Administrador'
    },
    {
      id: 2,
      nombreCompleto: 'María Gómez',
      nombreUsuario: 'mgomez',
      correoUsuario: 'maria@example.com',
      direccionDespacho: 'Calle Real 456',
      contrasena: 'Pass1234',
      fechaNacimiento: '1990-05-05',
      sesionIniciada: true,
      rol: 'Administrador'
    }
  ];

  beforeEach(async () => {
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', [
      'obtenerTodosLosUsuarios',
      'actualizarUsuario'
    ]);
    
    // Por defecto, devolvemos una lista con un usuario logueado (mockUsuarios[1])
    usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of(mockUsuarios));

    await TestBed.configureTestingModule({
      imports: [NavbaradminComponent, RouterTestingModule.withRoutes([]), HttpClientTestingModule],
      providers: [
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).overrideComponent(NavbaradminComponent, {
      add: {
        providers: [
          { provide: UsuarioService, useValue: usuarioServiceSpy }
        ]
      }
    })
    
    .compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(NavbaradminComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call obtenerTodosLosUsuarios if platform is browser', () => {
      fixture.detectChanges(); // llama a ngOnInit
      expect(usuarioServiceSpy.obtenerTodosLosUsuarios).toHaveBeenCalled();
      expect(component.listaUsuarios).toEqual(mockUsuarios);
      expect(component.usuariologeado?.id).toBe(2); // María Gómez está logueada
    });

    it('should not call obtenerTodosLosUsuarios if platform is server', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [NavbaradminComponent, RouterTestingModule.withRoutes([]), HttpClientTestingModule],
        providers: [
          { provide: UsuarioService, useValue: usuarioServiceSpy },
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      }).compileComponents();

      const fixtureServer = TestBed.createComponent(NavbaradminComponent);
      const componentServer = fixtureServer.componentInstance;
      fixtureServer.detectChanges(); // llama a ngOnInit con platform=server

      expect(usuarioServiceSpy.obtenerTodosLosUsuarios).not.toHaveBeenCalled();
      expect(componentServer.listaUsuarios).toEqual([]);
      expect(componentServer.usuariologeado).toBeUndefined();
    });
  });

  describe('verificarSesionUsuario', () => {
    it('should set usuariologeado if a user is logged in', () => {
      fixture.detectChanges();
      expect(component.usuariologeado?.id).toBe(2);
    });

    it('should not set usuariologeado if no user is logged in', () => {
      usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of([{
        ...mockUsuarios[0],
        sesionIniciada: false
      }]));
      fixture.detectChanges();
      expect(component.usuariologeado).toBeUndefined();
    });
  });

  describe('apagarSesionAdmin', () => {
    it('should do nothing if no user is logged in', () => {
      fixture.detectChanges();
      component.usuariologeado = undefined; // Simulamos que no hay usuario logueado
      
      spyOn(router, 'navigate');
      spyOn(window, 'alert');
    
      component.apagarSesionAdmin();
    
      // No se llama actualizarUsuario si no hay usuario logueado
      expect(usuarioServiceSpy.actualizarUsuario).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should log out the user and navigate to inicio if user is logged in', waitForAsync(() => {
      // Aseguramos que `obtenerTodosLosUsuarios` retorne un usuario logueado
      usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of(mockUsuarios));
    
      fixture.detectChanges(); // Dispara ngOnInit y la llamada al servicio
      fixture.whenStable().then(() => {
        // Ahora las suscripciones deben haber completado, y usuariologeado debería estar definido
        spyOn(router, 'navigate');
        spyOn(window, 'alert');
    
        // Mockeamos la actualización del usuario
        usuarioServiceSpy.actualizarUsuario.and.returnValue(of(mockUsuarios[1]));
    
        component.apagarSesionAdmin();
    
        expect(usuarioServiceSpy.actualizarUsuario).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Sesion Cerrada');
        expect(router.navigate).toHaveBeenCalledWith(['inicio']);
        expect(component.usuariologeado).toBeUndefined();
      });
    }));

    // it('should handle error when logging out the user', waitForAsync(() => {
    //   // Aseguramos que hay un usuario logueado
    //   usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of(mockUsuarios));
      
    //   fixture.detectChanges(); // dispara ngOnInit y llama a obtenerTodosLosUsuarios
    //   fixture.whenStable().then(() => {
    //     // Ahora las suscripciones deben haber completado y usuariologeado debe estar definido
    //     spyOn(router, 'navigate');
    //     spyOn(window, 'alert');
    //     spyOn(console, 'error');
    
    //     usuarioServiceSpy.actualizarUsuario.and.returnValue(throwError(() => 'Error Cerrando Sesión'));
    
    //     component.apagarSesionAdmin(); // Ahora si hay un usuario logueado, este flujo se ejecutará por completo
    
    //     expect(console.error).toHaveBeenCalledWith('Ocurrio un error al agregar un usuario:', 'Error Cerrando Sesión');
    //     expect(window.alert).toHaveBeenCalledWith('Sesion Cerrada');
    //     expect(router.navigate).toHaveBeenCalledWith(['inicio']);
    //     expect(component.usuariologeado).toBeUndefined();
    //   });
    // }));
    
  });

  describe('obtenerTodosLosUsuarios', () => {
    it('should fetch users and call verificarSesionUsuario', () => {
      spyOn(component, 'verificarSesionUsuario').and.callThrough();
      fixture.detectChanges(); // dispara obtenerTodosLosUsuarios
      expect(component.verificarSesionUsuario).toHaveBeenCalled();
      expect(component.listaUsuarios).toEqual(mockUsuarios);
    });
  });
});
