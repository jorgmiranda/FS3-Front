import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PagoProductosComponent } from './pago-productos.component';
import { UsuarioService } from '../../services/usuario.service';
import { CompraproductosService } from '../../services/compraproductos.service';
import { of, throwError } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PagoProductosComponent', () => {
  let component: PagoProductosComponent;
  let fixture: ComponentFixture<PagoProductosComponent>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;
  let compraProductoServiceSpy: jasmine.SpyObj<CompraproductosService>;
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
      sesionIniciada: true,
      rol: 'Administrador'
    }
  ];

  beforeEach(async () => {
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['obtenerTodosLosUsuarios']);
    compraProductoServiceSpy = jasmine.createSpyObj('CompraproductosService', ['crearCompra']);

    // Por defecto, devolvemos usuarios sin sesión iniciada
    usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of(mockUsuarios));

    await TestBed.configureTestingModule({
      imports: [PagoProductosComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        { provide: CompraproductosService, useValue: compraProductoServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' } // Por defecto usamos browser
      ]
    }).overrideComponent(PagoProductosComponent, {
      add: {
        providers: [
          { provide: UsuarioService, useValue: usuarioServiceSpy },
          { provide: CompraproductosService, useValue: compraProductoServiceSpy }
        ]
      }
    })
    .compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(PagoProductosComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should initialize with browser platform and load products from sessionStorage', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify([
        { idProducto: 1, cantidad: 2, precio: '$2,500' }
      ]));

      fixture.detectChanges(); // dispara ngOnInit
      expect(component.listaProductos.length).toBe(1);
      expect(usuarioServiceSpy.obtenerTodosLosUsuarios).toHaveBeenCalled();
    });

    it('should initialize with server platform and not load products from sessionStorage', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [PagoProductosComponent, HttpClientTestingModule, RouterTestingModule],
        providers: [
          { provide: UsuarioService, useValue: usuarioServiceSpy },
          { provide: CompraproductosService, useValue: compraProductoServiceSpy },
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      }).compileComponents();

      const fixtureServer = TestBed.createComponent(PagoProductosComponent);
      const componentServer = fixtureServer.componentInstance;
      spyOn(sessionStorage, 'getItem');
      fixtureServer.detectChanges();

      // No debería llamar a sessionStorage por no ser browser
      expect(sessionStorage.getItem).not.toHaveBeenCalled();
      expect(componentServer.listaProductos).toEqual([]);
    });
  });

  describe('verificarSesionUsuario', () => {
    it('should set usuariologeado if a user is logged in', () => {
      // mockUsuarios[1] tiene sesionIniciada: true
      fixture.detectChanges();
      expect(component.sesionIniciada).toBeTrue();
      expect(component.usuariologeado?.id).toBe(2);
    });

    it('should not set usuariologeado if no user is logged in', () => {
      // Ajustamos el return para que todos tengan sesionIniciada: false
      usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of([{
        ...mockUsuarios[0],
        sesionIniciada: false
      }]));
      fixture.detectChanges();

      expect(component.sesionIniciada).toBeFalse();
      expect(component.usuariologeado).toBeUndefined();
    });
  });

  describe('finalizarCompra', () => {
    beforeEach(() => {
      // Simulamos un usuario logueado
      usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of([{
        ...mockUsuarios[0],
        sesionIniciada: true,
        id: 10
      }]));
      spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify([
        { idProducto: 1, cantidad: 2, precio: '$2,500' },
        { idProducto: 2, cantidad: 1, precio: '$1,000' }
      ]));
      fixture.detectChanges();
    });

    it('should finalize purchase successfully', () => {
      compraProductoServiceSpy.crearCompra.and.returnValue(of({ message: 'ok' }));
      spyOn(window, 'alert');

      component.finalizarCompra();

      expect(compraProductoServiceSpy.crearCompra).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Compra realizada con éxito');
    });

    it('should handle error during purchase', () => {
      compraProductoServiceSpy.crearCompra.and.returnValue(throwError(() => 'Error'));
      spyOn(window, 'alert');

      component.finalizarCompra();

      expect(compraProductoServiceSpy.crearCompra).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Ocurrió un error al realizar la compra');
    });
  });

  describe('obtenerTodosLosUsuarios', () => {
    it('should call verificarSesionUsuario after fetching users', () => {
      spyOn(component, 'verificarSesionUsuario').and.callThrough();
      fixture.detectChanges();

      expect(component.verificarSesionUsuario).toHaveBeenCalled();
      expect(component.listaUsuarios).toEqual(mockUsuarios);
    });
  });

  describe('calcularTotal and calcularSubtotal', () => {
    it('should calculate subtotal correctly', () => {
      const producto = { cantidad: 2, precio: '$2,500' };
      const subtotal = component.calcularSubtotal(producto);
      // 2 * 2500 = 5000
      expect(subtotal).toBe(5000);
    });

    it('should calculate total correctly', () => {
      component.listaProductos = [
        { cantidad: 2, precio: '$2,500' }, // 5000
        { cantidad: 1, precio: '$1,000' }  // 1000
      ];
      const total = component.calcularTotal();
      expect(total).toBe(6000);
    });
  });

  it('should handle empty sessionStorage data', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PagoProductosComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        { provide: CompraproductosService, useValue: compraProductoServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    const fixtureNoData = TestBed.createComponent(PagoProductosComponent);
    const componentNoData = fixtureNoData.componentInstance;
    fixtureNoData.detectChanges();
    expect(componentNoData.listaProductos).toEqual([]);
  });
});
