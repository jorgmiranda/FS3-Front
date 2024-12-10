import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductoService } from './prodcuto.service'; 
import { Producto } from '../model/producto';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;

  const dummyProductos: Producto[] = [
    {
      id: 1,
      nombre: "Papel Higiénico",
      precio: 5200,
      descripcion: "Toalla HiperMax XL Doble Hoja 100 Mts",
      tipoProducto: "papel",
      urlImg: "assets/img/papel/Toalla Mediana HiperMax XL Doble Hoja.jpg",
    },
    {
      id: 2,
      nombre: "Jabón Líquido",
      precio: 1500,
      descripcion: "Jabón Líquido para manos, aroma limón",
      tipoProducto: "limpieza",
      urlImg: "assets/img/limpieza/jabon-liquido.jpg",
    },
  ];

  const dummyProducto: Producto = {
    id: 1,
    nombre: "Papel Higiénico",
    precio: 5200,
    descripcion: "Toalla HiperMax XL Doble Hoja 100 Mts",
    tipoProducto: "papel",
    urlImg: "assets/img/papel/Toalla Mediana HiperMax XL Doble Hoja.jpg",
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductoService],
    });

    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener todos los productos', () => {
    service.obtenerTodosLosProductos().subscribe((productos) => {
      expect(productos.length).toBe(2);
      expect(productos).toEqual(dummyProductos);
    });

    const req = httpMock.expectOne('http://localhost:8081/productos');
    expect(req.request.method).toBe('GET');
    req.flush(dummyProductos);
  });

  it('debería obtener un producto por ID', () => {
    service.obtenerProductoPorID(1).subscribe((producto) => {
      expect(producto).toEqual(dummyProducto);
    });

    const req = httpMock.expectOne('http://localhost:8081/productos/1');
    expect(req.request.method).toBe('GET');
    req.flush(dummyProducto);
  });

  it('debería agregar un nuevo producto', () => {
    const nuevoProducto: Producto = {
      id: 3,
      nombre: "Detergente",
      precio: 3000,
      descripcion: "Detergente en polvo, 1kg",
      tipoProducto: "limpieza",
      urlImg: "assets/img/limpieza/detergente.jpg",
    };

    service.agregarProducto(nuevoProducto).subscribe((producto) => {
      expect(producto).toEqual(nuevoProducto);
    });

    const req = httpMock.expectOne('http://localhost:8081/productos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevoProducto);
    req.flush(nuevoProducto);
  });

  it('debería obtener productos por tipo', () => {
    service.obtenerProductosPorTipo('papel').subscribe((productos) => {
      expect(productos.length).toBe(1);
      expect(productos).toEqual([dummyProducto]);
    });

    const req = httpMock.expectOne('http://localhost:8081/productos/tipo/papel');
    expect(req.request.method).toBe('GET');
    req.flush([dummyProducto]);
  });

  it('debería actualizar un producto', () => {
    const productoActualizado: Producto = {
      id: 1,
      nombre: "Papel Higiénico Deluxe",
      precio: 6000,
      descripcion: "Toalla HiperMax Deluxe Doble Hoja 120 Mts",
      tipoProducto: "papel",
      urlImg: "assets/img/papel/Toalla Mediana HiperMax Deluxe.jpg",
    };

    service.actualizarProducto(1, productoActualizado).subscribe((producto) => {
      expect(producto).toEqual(productoActualizado);
    });

    const req = httpMock.expectOne('http://localhost:8081/productos/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(productoActualizado);
    req.flush(productoActualizado);
  });

  it('debería eliminar un producto', () => {
    service.eliminarProducto(1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8081/productos/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
