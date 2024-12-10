import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UsuarioService } from '../services/usuario.service';
import { of, throwError } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;
  let router: Router;

  beforeEach(async () => {
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['obtenerTodosLosUsuarios', 'actualizarUsuario']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        NavbarComponent // <-- componente standalone con providers interno
      ],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
    .overrideComponent(NavbarComponent, {
      add: {
        providers: [
          { provide: UsuarioService, useValue: usuarioServiceSpy }
        ]
      }
    })
    .compileComponents();

    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of([]));
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize the carrito, instanciarShowHMTL and obtenerTodosLosUsuarios if platform is browser', () => {
      spyOn(component as any, 'inicializarCarrito').and.callThrough();
      spyOn(component as any, 'instanciarShowHMTL').and.callThrough();
      spyOn(component, 'obtenerTodosLosUsuarios').and.callThrough();

      component.ngOnInit();

      expect((component as any).inicializarCarrito).toHaveBeenCalled();
      expect((component as any).instanciarShowHMTL).toHaveBeenCalled();
      expect(component.obtenerTodosLosUsuarios).toHaveBeenCalled();
    });

    it('should not initialize carrito or show HTML if platform is not browser', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [RouterTestingModule, HttpClientTestingModule, NavbarComponent],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      })
      .overrideComponent(NavbarComponent, {
        add: {
          providers: [
            { provide: UsuarioService, useValue: usuarioServiceSpy }
          ]
        }
      })
      .compileComponents();
    
      const fixtureServer = TestBed.createComponent(NavbarComponent);
      const componentServer = fixtureServer.componentInstance;
      spyOn(componentServer as any, 'inicializarCarrito').and.callThrough();
      spyOn(componentServer as any, 'instanciarShowHMTL').and.callThrough();
    
      fixtureServer.detectChanges();
      componentServer.ngOnInit();
    
      expect((componentServer as any).inicializarCarrito).not.toHaveBeenCalled();
      expect((componentServer as any).instanciarShowHMTL).not.toHaveBeenCalled();
    });
  });

  describe('verificarSesionUsuario', () => {
    it('should set sesionIniciada to true if a user is logged in', () => {
      component.listaUsuarios = [{
        id: 1, nombreCompleto: 'Juan', correoUsuario: 'juan@example.com', contrasena: '123.pass', rol: 'Usuario',
        fechaNacimiento: '12-03-1997', nombreUsuario: 'juanito', direccionDespacho: 'Calle 123', sesionIniciada: true
      } as any];
      component.verificarSesionUsuario();

      expect(component.sesionIniciada).toBeTrue();
      expect(component.usuariologeado).toEqual({
        id: 1, nombreCompleto: 'Juan', correoUsuario: 'juan@example.com', contrasena: '123.pass', rol: 'Usuario',
        fechaNacimiento: '12-03-1997', nombreUsuario:'juanito', direccionDespacho:'Calle 123', sesionIniciada: true
      });
    });

    it('should not set sesionIniciada if no user is logged in', () => {
      component.listaUsuarios = [{ sesionIniciada: false, id: 1 } as any];
      component.verificarSesionUsuario();

      expect(component.sesionIniciada).toBeFalse();
      expect(component.usuariologeado).toBeUndefined();
    });

    it('should handle empty user list scenario', () => {
      component.listaUsuarios = [];
      component.verificarSesionUsuario();

      expect(component.sesionIniciada).toBeFalse();
      expect(component.usuariologeado).toBeUndefined();
    });
  });

  describe('cerrarSesion', () => {
    it('should log out the user and navigate to inicio', () => {
      const routerSpy = spyOn(router, 'navigate');
      usuarioServiceSpy.actualizarUsuario.and.returnValue(of({
        id: 1, nombreCompleto: 'Juan', correoUsuario: 'juan@example.com', contrasena: '123.pass', rol: 'Usuario',
        fechaNacimiento: '12-03-1997', nombreUsuario: 'juanito', direccionDespacho: 'Calle 123', sesionIniciada: false
      }));

      component.usuariologeado = { id: 1, sesionIniciada: true } as any;
      component.cerrarSesion();

      expect(component.sesionIniciada).toBeFalse();
      expect(component.usuariologeado).toBeUndefined();
      expect(routerSpy).toHaveBeenCalledWith(['/inicio']);
    });

    it('should do nothing if no user is logged in', () => {
      const routerSpy = spyOn(router, 'navigate');
      component.usuariologeado = undefined;

      component.cerrarSesion();

      expect(routerSpy).not.toHaveBeenCalled();
      expect(component.sesionIniciada).toBeFalse();
    });
  });

  describe('obtenerTodosLosUsuarios', () => {
    it('should fetch users and verify session', () => {
      spyOn(component, 'verificarSesionUsuario');
      usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of([{
        id: 1, nombreCompleto: 'Juan', correoUsuario: 'juan@example.com', contrasena: '123.pass', rol: 'Usuario',
        fechaNacimiento: '12-03-1997', nombreUsuario:'juanito', direccionDespacho:'Calle 123', sesionIniciada: false
      }]));
      component.obtenerTodosLosUsuarios();

      // Aquí la expectativa utiliza sólo id, así que ajustamos la comparación
      expect(component.listaUsuarios).toEqual([{ id: 1, 
        nombreCompleto: 'Juan', 
        correoUsuario: 'juan@example.com', 
        contrasena: '123.pass', 
        rol: 'Usuario',
        fechaNacimiento: '12-03-1997', 
        nombreUsuario: 'juanito', 
        direccionDespacho: 'Calle 123', 
        sesionIniciada: false } as any]);
      expect(component.verificarSesionUsuario).toHaveBeenCalled();
    });

    it('should handle empty user list', () => {
      spyOn(component, 'verificarSesionUsuario').and.callThrough();
      usuarioServiceSpy.obtenerTodosLosUsuarios.and.returnValue(of([]));
  
      component.obtenerTodosLosUsuarios();
  
      expect(component.listaUsuarios).toEqual([]);
      expect(component.verificarSesionUsuario).toHaveBeenCalled();
    });
  });

  describe('Private methods', () => {
    describe('inicializarCarrito', () => {
      it('should add event listener to the cart button', () => {
        const btnCart = document.createElement('div');
        const containerCartProducts = document.createElement('div');
        btnCart.classList.add('container-cart-icon');
        containerCartProducts.classList.add('container-cart-products');
        document.body.appendChild(btnCart);
        document.body.appendChild(containerCartProducts);

        (component as any).inicializarCarrito();

        // Simulamos click
        btnCart.click();
        expect(containerCartProducts.classList.contains('hidden-cart')).toBeFalse();

        // Limpieza DOM
        document.body.removeChild(btnCart);
        document.body.removeChild(containerCartProducts);
      });

      it('should do nothing if no cart button found', () => {
        // No agregamos el btnCart al DOM
        expect(() => {
          (component as any).inicializarCarrito();
        }).not.toThrow(); // Simplemente no hace nada
      });
    });

    describe('instanciarShowHMTL', () => {
      it('should call showHtml with correct arguments', () => {
        // Crear elementos con la misma estructura que el componente espera
        const rowProduct = document.createElement('div');
        rowProduct.classList.add('row-product', 'hidden');
            
        const valorTotal = document.createElement('span');
        valorTotal.id = 'total-pagar';
        valorTotal.classList.add('total-pagar');
            
        const contarProductos = document.createElement('span');
        contarProductos.id = 'contador-productos';
            
        const cartEmpty = document.createElement('p');
        cartEmpty.classList.add('cart-empty');
            
        const cartTotal = document.createElement('div');
        cartTotal.classList.add('cart-total', 'hidden');
            
        const cartButton = document.createElement('div');
        cartButton.classList.add('cart-button', 'hidden');
            
        // Agregar los elementos al DOM
        document.body.appendChild(rowProduct);
        document.body.appendChild(valorTotal);
        document.body.appendChild(contarProductos);
        document.body.appendChild(cartEmpty);
        document.body.appendChild(cartTotal);
        document.body.appendChild(cartButton);
            
        const showHtmlSpy = spyOn(component as any, 'showHtml').and.callThrough();
        (component as any).instanciarShowHMTL();
            
        // Obtenemos los argumentos con los que fue llamado showHtml
        const callArgs = showHtmlSpy.calls.argsFor(0);
      
        // Verificamos usando objectContaining, revisando solo las propiedades clave
        expect(callArgs[0]).toEqual(jasmine.objectContaining({ className: 'row-product hidden' }));
        expect(callArgs[1]).toEqual(jasmine.objectContaining({ id: 'total-pagar', className: 'total-pagar' }));
        expect(callArgs[2]).toEqual(jasmine.objectContaining({ id: 'contador-productos' }));
        expect(callArgs[3]).toEqual(jasmine.objectContaining({ className: 'cart-empty' }));
        expect(callArgs[4]).toEqual(jasmine.objectContaining({ className: 'cart-total hidden' }));
        expect(callArgs[5]).toEqual(jasmine.objectContaining({ className: 'cart-button hidden' }));
            
        // Limpieza del DOM
        document.body.removeChild(rowProduct);
        document.body.removeChild(valorTotal);
        document.body.removeChild(contarProductos);
        document.body.removeChild(cartEmpty);
        document.body.removeChild(cartTotal);
        document.body.removeChild(cartButton);
      });
      

      // it('should do nothing if required elements do not exist', () => {
      //   spyOn(component as any, 'showHtml');
        
      //   // No agregamos ningún elemento al DOM, por lo tanto no existe nada que "instanciarShowHMTL" pueda usar.
      //   (component as any).instanciarShowHMTL();
      
      //   expect((component as any).showHtml).not.toHaveBeenCalled();
      // });
    });

    describe('showHtml', () => {
      let rowProduct: HTMLDivElement;
      let valorTotal: HTMLDivElement;
      let contarProductos: HTMLDivElement;
      let cartEmpty: HTMLDivElement;
      let cartTotal: HTMLDivElement;
      let cartButton: HTMLDivElement;

      beforeEach(() => {
        rowProduct = document.createElement('div');
        valorTotal = document.createElement('div');
        contarProductos = document.createElement('div');
        cartEmpty = document.createElement('div');
        cartTotal = document.createElement('div');
        cartButton = document.createElement('div');
      });

      it('should update cart HTML correctly with products', () => {
        component.listaProductos = [
          { cantidad: 1, titulo: 'Producto 1', precio: '$1,000' },
          { cantidad: 2, titulo: 'Producto 2', precio: '$2,000' }
        ];

        (component as any).showHtml(rowProduct, valorTotal, contarProductos, cartEmpty, cartTotal, cartButton);

        expect(rowProduct.innerHTML).toContain('Producto 1');
        expect(rowProduct.innerHTML).toContain('Producto 2');
        expect(valorTotal.innerText).toBe('$5.000');
        expect(contarProductos.innerText).toBe('3');
        expect(cartEmpty.style.display).toBe('');
        expect(cartTotal.style.display).toBe('');
        expect(cartButton.style.display).toBe('');
      });

      it('should handle empty product list', () => {
        component.listaProductos = [];

        (component as any).showHtml(rowProduct, valorTotal, contarProductos, cartEmpty, cartTotal, cartButton);

        expect(rowProduct.innerHTML).toBe('');
        expect(valorTotal.innerText).toBe('$0');
        expect(contarProductos.innerText).toBe('0');
        expect(cartEmpty.style.display).toBe('');
        expect(cartTotal.style.display).toBe('');
        expect(cartButton.style.display).toBe('');
      });

      it('should handle price formatting and sum correctly', () => {
        component.listaProductos = [
          { cantidad: 2, titulo: 'Producto X', precio: '$2,500' }, // total: $5,000
          { cantidad: 3, titulo: 'Producto Y', precio: '$500' }    // total: $1,500
        ]; 
        // Suma total: $6,500

        (component as any).showHtml(rowProduct, valorTotal, contarProductos, cartEmpty, cartTotal, cartButton);

        expect(valorTotal.innerText).toBe('$6.500');
        expect(contarProductos.innerText).toBe('5');
      });
    });
  });
});
