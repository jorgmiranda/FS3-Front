import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Producto } from '../model/producto';

/**
 * Servicio para gestionar operaciones CRUD de Productos desde sessionStorage.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  /**
   * Clave para almacenar productos en sessionStorage.
   */
  private storageKey = 'productos';

  constructor() {}

  /**
   * Obtiene la lista de todos los productos desde sessionStorage.
   * @returns Un Observable con la lista de productos.
   */
  obtenerTodosLosProductos(): Observable<Producto[]> {
    const productos = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    return of(productos);
  }

  /**
   * Obtiene un producto por su ID desde sessionStorage.
   * @param id - ID del producto a obtener.
   * @returns Un Observable con el producto correspondiente al ID o null si no existe.
   */
  obtenerProductoPorID(id: number): Observable<Producto | null> {
    const productos: Producto[] = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    const producto = productos.find(p => p.id === id);
    return of(producto || null);
  }

  /**
   * Agrega un nuevo producto en sessionStorage.
   * @param producto - Objeto de producto a agregar.
   * @returns Un Observable con el producto agregado.
   */
  agregarProducto(producto: Producto, seccion: String): Observable<Producto> {
    const productos: Producto[] = JSON.parse(sessionStorage.getItem(this.storageKey +"_"+seccion) || '[]');
    productos.push(producto);
    sessionStorage.setItem(this.storageKey+"_"+seccion, JSON.stringify(productos));
    return of(producto);
  }

  /**
   * Obtiene productos por su tipo desde sessionStorage.
   * @param tipo - Tipo de producto a obtener.
   * @returns Un Observable con los productos obtenidos según su tipo.
   */
  obtenerProductosPorTipo(tipo: string): Observable<Producto[]> {
    const productos: Producto[] = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    const productosFiltrados = productos.filter(p => p.tipoProducto === tipo);
    return of(productosFiltrados);
  }

  /**
   * Actualiza un producto existente en sessionStorage.
   * @param id - ID del producto a actualizar.
   * @param producto - Objeto de producto con los nuevos datos.
   * @returns Un Observable con el producto actualizado.
   */
  actualizarProducto(id: number, producto: Producto,  seccion: String): Observable<Producto> {
    const productos: Producto[] = JSON.parse(sessionStorage.getItem(this.storageKey+"_"+seccion) || '[]');
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
      productos[index] = producto;
      sessionStorage.setItem(this.storageKey+"_"+seccion, JSON.stringify(productos));
    }
    return of(producto);
  }

  /**
   * Elimina un producto por su ID en sessionStorage.
   * @param id - ID del producto a eliminar.
   * @returns Un Observable vacío que indica la eliminación.
   */
  eliminarProducto(id: number, seccion: String): Observable<void> {
    const productos: Producto[] = JSON.parse(sessionStorage.getItem(this.storageKey+"_"+seccion) || '[]');
    const productosActualizados = productos.filter(p => p.id !== id);
    sessionStorage.setItem(this.storageKey+"_"+seccion, JSON.stringify(productosActualizados));
    return of(void 0);
  }
}
