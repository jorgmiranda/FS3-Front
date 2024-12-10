import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../model/producto';
import { Compra } from '../model/compra';

@Injectable({
  providedIn: 'root'
})
export class CompraproductosService {

   /**
   * Opciones de cabecera HTTP para las solicitudes.
   */
   httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json"
    })
  }

  /**
   * URL base del endpoint de Compras.
   */
  private baseUrl = 'http://localhost:8083/compras';
  // private baseUrl = 'http://52.200.236.194:8083/compras';

  private urlExtraProductos = 'http://localhost:8083/productos'

  /**
   * Constructor del servicio que inyecta el HttpClient.
   * @param http HttpClient para realizar solicitudes HTTP.
   */
  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de todos los Productos.
   * @returns Un Observable con la lista de productos
   */
  obtenerTodosLosProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.urlExtraProductos);
  }


  /**
   * Obtiene los productos segun su tipo
   * @param tipo - Tipo de producto a obtener
   * @returns - Un observable con los productos obtenidos segun su tipo
   */
  obtenerProductosPorTipo(tipo: String): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.urlExtraProductos}/tipo/${tipo}`);
  }

  buscarProductosPorNombre(nombre: String): Observable<Producto[]>{
    return this.http.get<Producto[]>(`${this.urlExtraProductos}/nombre/${nombre}`);
  }


  /* --------------------Gestión de compras ---------------------- */

  crearCompra(compra: Compra): Observable<any> {
    return this.http.post<any>(this.baseUrl, compra);
  }
}
