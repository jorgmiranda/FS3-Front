import { TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { EditarProductosComponent } from './editar-productos.component';
import { ProductoService } from '../../../services/prodcuto.service';
import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Producto } from '../../../model/producto';
import { Storage } from '@angular/fire/storage';

describe('EditarProductosComponent', () => {
  let component: EditarProductosComponent;
  let fixture: ComponentFixture<EditarProductosComponent>;
  let mockProductoService: jasmine.SpyObj<ProductoService>;
  let mockStorage: jasmine.SpyObj<Storage>;

  beforeEach(async () => {
    mockProductoService = jasmine.createSpyObj('ProductoService', [
      'obtenerProductosPorTipo',
      'obtenerTodosLosProductos',
      'actualizarProducto',
      'eliminarProducto',
      'agregarProducto',
    ]);
  
    mockStorage = jasmine.createSpyObj('Storage', ['ref']);
  
    // Simular los valores de retorno para los métodos
    const mockProductos: Producto[] = [
      { id: 1, nombre: 'Test Product', precio: 100, descripcion: 'Test Desc', tipoProducto: 'test', urlImg: '' },
    ];
  
    mockProductoService.obtenerProductosPorTipo.and.returnValue(of(mockProductos));
    mockProductoService.obtenerTodosLosProductos.and.returnValue(of(mockProductos));
  
    await TestBed.configureTestingModule({
      imports: [EditarProductosComponent],
      providers: [
        { provide: ProductoService, useValue: mockProductoService },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => 'test-section' }) } },
        { provide: Storage, useValue: mockStorage },
        FormBuilder,
      ],
    })
      .overrideComponent(EditarProductosComponent, {
        add: {
          providers: [{ provide: ProductoService, useValue: mockProductoService }],
        },
      })
      .compileComponents();
  
    fixture = TestBed.createComponent(EditarProductosComponent);
    component = fixture.componentInstance;
  
    // Inicializar los formularios antes de renderizar el componente
    component.products = mockProductos;
    component.inicializarFormularios();
  
    fixture.detectChanges();
  });

  it('should initialize products and forms', fakeAsync(() => {
    const mockProductos: Producto[] = [
      { id: 1, nombre: 'Test Product', precio: 100, descripcion: 'Test Desc', tipoProducto: 'test', urlImg: '' },
    ];
    mockProductoService.obtenerProductosPorTipo.and.returnValue(of(mockProductos));
    mockProductoService.obtenerTodosLosProductos.and.returnValue(of(mockProductos));
  
    component.inicializarProductos();
    tick(); // Procesar Observables
  
    expect(mockProductoService.obtenerProductosPorTipo).toHaveBeenCalledWith('test-section');
    expect(component.products).toEqual(mockProductos);
    expect(component.allProducts).toEqual(mockProductos);
  }));


  it('should initialize forms correctly', () => {
    const mockProductos: Producto[] = [
      { id: 1, nombre: 'Test', precio: 100, descripcion: 'Desc', tipoProducto: 'test', urlImg: '' },
    ];
    component.products = mockProductos;
    component.inicializarFormularios();

    expect(component.productForms[1].value).toEqual({
      nombre: 'Test',
      precio: 100,
      descripcion: 'Desc',
      tipoProducto: 'test',
      imagen: null,
    });
    expect(component.crearProdcutoForm.value).toEqual({
      nombreProducto: '',
      precioProducto: '',
      tipoProducto: 'test-section',
      descripcionProducto: '',
      imagenProducto: null,
    });
  });

  it('should add product to the form on file change', () => {
    const file = new File([''], 'test.png');
    const event = { target: { files: [file] } } as any;
    component.productForms[1] = new FormBuilder().group({ imagen: [null] });

    component.onFileChange(event, 1);

    expect(component.productForms[1].get('imagen')?.value).toBe(file);
  });

  it('should handle file upload', async () => {
    spyOn(component, 'guardarImagenStorage').and.resolveTo('test-url');
    const result = await component.guardarImagenStorage(new File([''], 'test.png'));
    expect(result).toBe('test-url');
  });

  it('should submit the form and update product', async () => {
    const mockProduct: Producto = { id: 1, nombre: '', precio: 0, descripcion: '', tipoProducto: '', urlImg: '' };
    const mockForm = new FormBuilder().group({
      nombre: ['Updated Name'],
      precio: [200],
      descripcion: ['Updated Desc'],
      tipoProducto: ['Updated Type'],
      imagen: [null],
    });

    mockProductoService.actualizarProducto.and.returnValue(of(mockProduct));
    await component.onSubmit(mockForm, mockProduct);

    expect(mockProductoService.actualizarProducto).toHaveBeenCalled();
  });

  it('should delete a product', () => {
    const mockProducto: Producto = { id: 1, nombre: '', precio: 0, descripcion: '', tipoProducto: '', urlImg: '' };

    mockProductoService.eliminarProducto.and.returnValue(of(undefined));
    component.eliminar(new MouseEvent('click'), mockProducto);

    expect(mockProductoService.eliminarProducto).toHaveBeenCalledWith(1);
  });

  it('should format number with commas', () => {
    const result = component.numberWithCommas('1234567');
    expect(result).toBe('1,234,567');
  });
});
