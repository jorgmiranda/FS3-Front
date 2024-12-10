import { Component, OnInit, Inject, PLATFORM_ID, ViewEncapsulation, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../footer/footer.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { CompraproductosService } from '../../services/compraproductos.service';
import { isPlatformBrowser } from '@angular/common';
import { Usuario } from '../../model/usuario';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Compradetalle } from '../../model/compradetalle';
import { Compra } from '../../model/compra';

@Component({
  selector: 'app-pago-productos',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule, RouterModule],
  templateUrl: './pago-productos.component.html',
  styleUrl: './pago-productos.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [CompraproductosService, UsuarioService]
})
export class PagoProductosComponent {

  listaProductos: any[] = [];

  listaUsuarios: any[] = [];

  sesionIniciada: boolean = false;

  usuariologeado?: Usuario;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private elRef: ElementRef
    , private compraProductoService: CompraproductosService,  private usuarioService: UsuarioService,  private router:Router) { }


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.listaProductos = JSON.parse(sessionStorage.getItem('listaProductos') || '[]');
      
    }
    this.obtenerTodosLosUsuarios();
  }


  finalizarCompra():void{
    let compradetalles: Compradetalle[] = [];
    
    this.listaProductos.forEach((producto) =>{
      const compradetalle: Compradetalle = {
        productoId: producto.idProducto,
        cantidad: producto.cantidad
      }
      compradetalles.push(compradetalle)
    });

    const compra: Compra = {
      usuarioId: this.usuariologeado!.id,
      detalles: compradetalles
    }

    this.compraProductoService.crearCompra(compra).subscribe({
      next: (response) => {
        console.log('Compra realizada con éxito:', response);
        alert('Compra realizada con éxito');
      },
      error: (err) => {
        console.error('Error al realizar la compra:', err);
        alert('Ocurrió un error al realizar la compra');
      }
    });

  }


  verificarSesionUsuario(): void {
    if (this.listaUsuarios) {
      this.listaUsuarios.forEach((usuario) => {
        if (usuario.sesionIniciada) {
          this.sesionIniciada = true;
          this.usuariologeado = usuario;
        }
      });
    }
  }

  /**
   * Obtiene todos los usuarios registrados en el JSON REST
   * Una vez obtenidos, llama al metodo verificarSessionUsuario
   */
  obtenerTodosLosUsuarios():void{
    this.usuarioService.obtenerTodosLosUsuarios().subscribe(data => {
      this.listaUsuarios = data;
      this.verificarSesionUsuario();
    });
  }

  calcularTotal(): number {
    return this.listaProductos.reduce(
      (total, producto) => total + this.calcularSubtotal(producto),
      0
    );
  }

  /**
   * Calcula el subtotal de un producto
   */
  calcularSubtotal(producto: any): number {
   
    return producto.cantidad *  parseInt(producto.precio.replace(',', '').replace('$', ''));
  }

}
