import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CompraproductosService } from './compraproductos.service';
import { Producto } from '../model/producto';
import { Compra } from '../model/compra';

describe('CompraproductosService', () => {
  let service: CompraproductosService;
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

  const dummyCompra: Compra = {
    usuarioId: 1,
    detalles: [
      { productoId: 1, cantidad: 2 },
      { productoId: 2, cantidad: 1 },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CompraproductosService],
    });

    service = TestBed.inject(CompraproductosService);
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

    const req = httpMock.expectOne('http://localhost:8083/productos');
    expect(req.request.method).toBe('GET');
    req.flush(dummyProductos);
  });

  it('debería obtener productos por tipo', () => {
    service.obtenerProductosPorTipo('papel').subscribe((productos) => {
      expect(productos.length).toBe(1);
      expect(productos).toEqual([dummyProductos[0]]);
    });

    const req = httpMock.expectOne('http://localhost:8083/productos/tipo/papel');
    expect(req.request.method).toBe('GET');
    req.flush([dummyProductos[0]]);
  });

  it('debería buscar productos por nombre', () => {
    service.buscarProductosPorNombre('Jabón').subscribe((productos) => {
      expect(productos.length).toBe(1);
      expect(productos).toEqual([dummyProductos[1]]);
    });

    const req = httpMock.expectOne('http://localhost:8083/productos/nombre/Jabón');
    expect(req.request.method).toBe('GET');
    req.flush([dummyProductos[1]]);
  });

  it('debería crear una compra', () => {
    const respuestaEsperada = { mensaje: 'Compra creada exitosamente' };

    service.crearCompra(dummyCompra).subscribe((respuesta) => {
      expect(respuesta).toEqual(respuestaEsperada);
    });

    const req = httpMock.expectOne('http://localhost:8083/compras');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dummyCompra);
    req.flush(respuestaEsperada);
  });
});
