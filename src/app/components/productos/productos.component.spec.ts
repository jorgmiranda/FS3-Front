import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ProductosComponent } from './productos.component';
import { CompraproductosService } from '../../services/compraproductos.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ElementRef, PLATFORM_ID } from '@angular/core';
import { Producto } from '../../model/producto';

describe('ProductosComponent', () => {
  let component: ProductosComponent;
  let fixture: ComponentFixture<ProductosComponent>;
  let mockProductoService: jasmine.SpyObj<CompraproductosService>;

  beforeEach(async () => {
    mockProductoService = jasmine.createSpyObj('CompraproductosService', ['obtenerProductosPorTipo']);

    await TestBed.configureTestingModule({
      imports: [ProductosComponent],
      providers: [
        { provide: CompraproductosService, useValue: mockProductoService },
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => 'test-section' }) },
        },
      ],
    }).overrideComponent(ProductosComponent, {
        add: {
          providers: [
            { provide: CompraproductosService, useValue: mockProductoService }
          ]
        }
      })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosComponent);
    component = fixture.componentInstance;

    mockProductoService.obtenerProductosPorTipo.and.returnValue(of([]));
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize products based on a valid section', fakeAsync(() => {
    // Simular productos
    const mockProductos: Producto[] = [
      { id: 1, nombre: 'Producto 1', precio: 1000, descripcion: 'Desc 1', tipoProducto: 'cuidado_capilar', urlImg: '' },
      { id: 2, nombre: 'Producto 2', precio: 2000, descripcion: 'Desc 2', tipoProducto: 'cuidado_capilar', urlImg: '' },
    ];
  
    // Mock del servicio
    mockProductoService.obtenerProductosPorTipo.and.returnValue(of(mockProductos));
  
    // Configurar la sección directamente en el componente
    component.seccion = 'cuidado_capilar';
  
    // Llamar al método de inicialización
    component.inicializarProductos();
  
    // Avanzar el tiempo para resolver las suscripciones
    tick();
  
    // Verificar que el servicio fue llamado con la sección correcta
    expect(mockProductoService.obtenerProductosPorTipo).toHaveBeenCalledWith('cuidado_capilar');
  
    // Verificar que los productos se asignaron correctamente
    expect(component.productos).toEqual(mockProductos);
  }));

  it('should handle click event and add product to cart', () => {
    spyOn(sessionStorage, 'setItem');
  
    // Crear la estructura esperada en el DOM
    const mockContainer = document.createElement('div');
    mockContainer.classList.add('card-container');
  
    const mockRowProduct = document.createElement('div');
    mockRowProduct.classList.add('row-product');
  
    const mockCartEmpty = document.createElement('div');
    mockCartEmpty.classList.add('cart-empty');
  
    const mockCartTotal = document.createElement('div');
    mockCartTotal.classList.add('cart-total');
  
    const mockCartButton = document.createElement('div');
    mockCartButton.classList.add('cart-button');
  
    const mockTotalPagar = document.createElement('div');
    mockTotalPagar.id = 'total-pagar';
  
    const mockContadorProductos = document.createElement('div');
    mockContadorProductos.id = 'contador-productos';
  
    // Crear el producto simulado con la estructura esperada
    const mockButton = document.createElement('div');
    mockButton.classList.add('btn-add-cart');
    mockButton.innerHTML = `
      <span class="card-id">SKU: 1</span>
      <h5>Producto 1</h5>
      <span class="precio">Precio: 1000</span>
    `;
    mockContainer.appendChild(mockButton);
  
    // Simular el DOM dentro de elRef.nativeElement
    const elRefMock = {
      nativeElement: document.createElement('div'),
    };
    elRefMock.nativeElement.appendChild(mockContainer);
    elRefMock.nativeElement.appendChild(mockRowProduct);
    elRefMock.nativeElement.appendChild(mockCartEmpty);
    elRefMock.nativeElement.appendChild(mockCartTotal);
    elRefMock.nativeElement.appendChild(mockCartButton);
    elRefMock.nativeElement.appendChild(mockTotalPagar);
    elRefMock.nativeElement.appendChild(mockContadorProductos);
  
    // Reemplazar el ElementRef del componente
    component['elRef'] = elRefMock as ElementRef;
  
    // Crear el evento de clic
    const event = new MouseEvent('click');
    spyOnProperty(event, 'target', 'get').and.returnValue(mockButton);
  
    // Llamar al método onClick
    component.onClick(event);
  
    // Verificar que el producto fue agregado al carrito
    expect(component.listaProductos.length).toBe(1);
    expect(component.listaProductos[0]).toEqual({
      idProducto: '1',
      cantidad: 1,
      titulo: 'Producto 1',
      precio: '1000',
    });
  
    // Verificar que sessionStorage.setItem fue llamado
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'listaProductos',
      JSON.stringify(component.listaProductos)
    );
  });
  

  it('should update cart HTML on product addition', () => {
    spyOn(component as any, 'showHtml').and.callThrough();
    component.listaProductos = [
      { idProducto: '1', titulo: 'Producto 1', precio: '1000', cantidad: 1 },
    ];
    const mockRowProduct = document.createElement('div');
    mockRowProduct.classList.add('row-product');

    const mockCartElements = {
      rowProduct: mockRowProduct,
      valorTotal: document.createElement('div'),
      contarProductos: document.createElement('div'),
      cartEmpty: document.createElement('div'),
      cartTotal: document.createElement('div'),
      cartButton: document.createElement('div'),
    };

    (component as any).showHtml(
      mockCartElements.rowProduct,
      mockCartElements.valorTotal,
      mockCartElements.contarProductos,
      mockCartElements.cartEmpty,
      mockCartElements.cartTotal,
      mockCartElements.cartButton
    );

    expect(mockCartElements.valorTotal.innerText).toBe('$1.000');
    expect(mockCartElements.contarProductos.innerText).toBe('1');
    expect(mockRowProduct.innerHTML).toContain('Producto 1');
  });

  it('should format total price in showHtml correctly', () => {
    // Configurar productos simulados
    component.listaProductos = [
      { cantidad: 2, titulo: 'Producto 1', precio: '1000' },
      { cantidad: 3, titulo: 'Producto 2', precio: '2000' },
    ];
  
    // Mock de elementos del DOM
    const rowProduct = document.createElement('div');
    const valorTotal = document.createElement('div');
    const contarProductos = document.createElement('div');
    const cartEmpty = document.createElement('div');
    const cartTotal = document.createElement('div');
    const cartButton = document.createElement('div');
  
    // Llamar a showHtml para actualizar el carrito
    (component as any).showHtml(rowProduct, valorTotal, contarProductos, cartEmpty, cartTotal, cartButton);
  
    // Verificar el formato correcto del precio total
    expect(valorTotal.innerText).toBe('$8.000'); // (2*1000 + 3*2000 = 7000, formato chileno)
  });

  it('should initialize cart functionality if platform is browser', () => {
    spyOn(document, 'querySelector').and.returnValue(document.createElement('div'));
    component.ngOnInit();
    expect(component.listaProductos).toEqual([]);
  });
});
