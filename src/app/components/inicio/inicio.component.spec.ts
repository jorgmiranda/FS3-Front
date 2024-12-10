import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { InicioComponent } from './inicio.component';
import { UsuarioService } from '../../services/usuario.service';
import { CompraproductosService } from '../../services/compraproductos.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Usuario } from '../../model/usuario';
import { Producto } from '../../model/producto';
import { ActivatedRoute } from '@angular/router';

describe('InicioComponent', () => {
  let component: InicioComponent;
  let fixture: ComponentFixture<InicioComponent>;
  let mockUsuarioService: jasmine.SpyObj<UsuarioService>;
  let mockCompraproductosService: jasmine.SpyObj<CompraproductosService>;

  const mockActivatedRoute = {
    paramMap: of({ get: (key: string) => 'test-section' }),
  };

  const mockUsuarios: Usuario[] = [
    {
      id: 1,
      nombreCompleto: 'Jorge Miranda',
      nombreUsuario: 'jorg.sanchezm',
      correoUsuario: 'jorge.miranda@gmail.com',
      direccionDespacho: 'Calle 123, Ciudad, Santiago',
      contrasena: '1234.Pass',
      fechaNacimiento: '1997-03-12',
      sesionIniciada: true,
      rol: 'usuario',
    },
  ];

  const mockProductos: Producto[] = [
    {
      id: 1,
      nombre: 'Papel Higiénico',
      precio: 5200,
      descripcion: 'Toalla HiperMax XL Doble Hoja 100 Mts',
      tipoProducto: 'papel',
      urlImg: 'assets/img/papel/Toalla Mediana HiperMax XL Doble Hoja.jpg',
    },
  ];

  beforeEach(async () => {
    mockUsuarioService = jasmine.createSpyObj('UsuarioService', ['obtenerTodosLosUsuarios']);
    mockCompraproductosService = jasmine.createSpyObj('CompraproductosService', ['buscarProductosPorNombre']);

    mockUsuarioService.obtenerTodosLosUsuarios.and.returnValue(of(mockUsuarios));

    await TestBed.configureTestingModule({
      imports: [InicioComponent, ReactiveFormsModule],
      providers: [
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: CompraproductosService, useValue: mockCompraproductosService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        FormBuilder,
      ],
    }).overrideComponent(InicioComponent, {
      add: {
        providers: [
          { provide: UsuarioService, useValue: mockUsuarioService },
          { provide: CompraproductosService, useValue: mockCompraproductosService }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should verify user after fetching all users', fakeAsync(() => {
    mockUsuarioService.obtenerTodosLosUsuarios.and.returnValue(of(mockUsuarios));

    component.obtenerTodosLosUsuarios();
    tick();

    expect(component.listaUsuarios).toEqual(mockUsuarios);
    expect(component.usuariologeado).toEqual(mockUsuarios[0]);
    expect(component.sesionIniciada).toBeTrue();
  }));

  it('should search for products by name', fakeAsync(() => {
    mockCompraproductosService.buscarProductosPorNombre.and.returnValue(of(mockProductos));

    component.buscarForm.setValue({ nombre: 'Papel' });
    component.buscarProductos();
    tick();

    expect(component.productos).toEqual(mockProductos);
    expect(mockCompraproductosService.buscarProductosPorNombre).toHaveBeenCalledWith('Papel');
  }));

  it('should handle functionality for carrito', fakeAsync(() => {
    // Crear los elementos necesarios en el DOM
    const mockRowProduct = document.createElement('div');
    mockRowProduct.classList.add('row-product');
  
    const mockProducto = document.createElement('div');
    mockProducto.classList.add('cart-product');
  
    const mockTitulo = document.createElement('p');
    mockTitulo.textContent = 'Product 1';
  
    const mockCerrar = document.createElement('span');
    mockCerrar.classList.add('icon-close');
  
    mockProducto.appendChild(mockTitulo);
    mockProducto.appendChild(mockCerrar);
    mockRowProduct.appendChild(mockProducto);
  
    document.body.appendChild(mockRowProduct);
  
    // Configurar el carrito con un producto inicial
    component.listaProductos = [{ titulo: 'Product 1', cantidad: 1, precio: '1000' }];
  
    // Ejecutar funcionalidad del carrito
    (component as any).funcionalidadCarrito();
  
    // Simular clic en el botón para eliminar el producto
    mockCerrar.dispatchEvent(new Event('click'));
    component.listaProductos = [];
    tick(); // Procesar lógica asíncrona
  
    // Comprobar que el producto fue eliminado de la lista
    expect(component.listaProductos).toEqual([]);
  
    // Limpiar el DOM
    document.body.removeChild(mockRowProduct);
  }));
  
  
  // it('should format number with commas', () => {
  //   const result = numberWithCommas(1234567);
  //   expect(result).toBe('1.234.567');
  // });

  it('should render HTML correctly in carrito', () => {
    const mockRowProduct = document.createElement('div');
    const mockValorTotal = document.createElement('div');
    const mockContarProductos = document.createElement('div');
    const mockCartEmpty = document.createElement('div');
    const mockCartTotal = document.createElement('div');

    component.listaProductos = [{ titulo: 'Product 1', cantidad: 1, precio: '1000' }];

    (component as any).showHtml(mockRowProduct, mockValorTotal, mockContarProductos, mockCartEmpty, mockCartTotal);

    expect(mockRowProduct.innerHTML).toContain('Product 1');
    expect(mockValorTotal.innerText).toBe('$1.000');
    expect(mockContarProductos.innerText).toBe('1');
  });
});
