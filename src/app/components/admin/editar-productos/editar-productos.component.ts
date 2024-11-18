import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { NavbaradminComponent } from '../navbaradmin/navbaradmin.component';
import { FooterComponent } from '../../../footer/footer.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Producto } from '../../../model/producto';
import { ProductoService } from '../../../services/prodcuto.service';


/**
 * Se declara la variable de bootstrap para el modal
 */
declare var bootstrap: any;

/**
 * @description
 * Componente para editar productos en diferentes secciones. Permite inicializar productos según la sección,
 * gestionar formularios de edición y actualizar la información de los productos.
 */
@Component({
  selector: 'app-editar-productos',
  standalone: true,
  imports: [NavbaradminComponent, CommonModule, FooterComponent, ReactiveFormsModule],
  templateUrl: './editar-productos.component.html',
  styleUrl: './editar-productos.component.scss',
  providers: [ProductoService],
  encapsulation: ViewEncapsulation.None
})
export class EditarProductosComponent implements OnInit{
  /**
   * Variable sección que mostrara los productos según corresponda
   */
  seccion: string = ''; 
   /**
   * instancia de form group
   */
   productForms: { [key: number]: FormGroup } = {};
   /**
    * Instancia de formulario para creación de productos
    */
   crearProdcutoForm!: FormGroup;
  /**
   * Instancia vacia de arreglo de productos
   */
  products: any[] = [];

   /**
   * Tipo de productos
   */
   opciones: { value: string, display: string }[] = [
    { value: 'cuidado_capilar', display: 'Cuidado Capilar' },
    { value: 'cuidado_ropa', display: 'Cuidado de Ropa' },
    { value: 'limpieza', display: 'Limpieza' },
    { value: 'papel', display: 'Papel' },
  ];

  
  /**
   * Instancia de modal utilizada para la creación de productos
   */
  modalInstance: any;


  /**
   * @constructor
   * @param route - Servicio de enrutamiento de Angular
   * @param fb - Servicio de creación de formulario de Angular
   */
  constructor(private route: ActivatedRoute, private fb: FormBuilder, private productoService: ProductoService) { }

  /**
   * Metodo de inicialización del componente
   * Obtiene la sección de la ruta y llama a los métodos para inicializar productos y formularios.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.seccion = params.get('seccion') || '';
      this.inicializarProductos();
      this.inicializarFormularios();
      this.modalInstance = new bootstrap.Modal(document.getElementById('productoModal'));
    });
    
    
  }

  /**
   * Inicializa la lista de productos basada en la sección actual.
   */

  inicializarProductos() {
    const storedProducts = sessionStorage.getItem(`productos_${this.seccion}`);
    if (storedProducts) {
      // Leer desde sessionStorage
      this.products = JSON.parse(storedProducts);
    } else {
      // Inicializar y guardar en sessionStorage
      this.products = this.obtenerProductosPorSeccion(this.seccion);
      sessionStorage.setItem(`productos_${this.seccion}`, JSON.stringify(this.products));
    }
  }



  obtenerProductosPorSeccion(seccion: string): any[] {
    if (this.seccion === 'cuidado_capilar') {
      return  [
        {
          id:1,
          nombre: 'Acond. DoyPack IO Camomilla 1000ml',
          precio: '1020',
          descripcion: 'Descubre el arte del cuidado personal con el Acondicionador DoyPack IO Camomilla. Este producto incorpora esencias de camomila que nutren, revitalizan y dan suavidad a tu cabello.',
          urlImg: 'assets/img/cuidado_capilar/Acond. DoyPack IO Camomilla 1000ml.jpg',
        },
        {
          id:2,
          nombre: 'Acond. DoyPack IO Hierbas 1000ml',
          precio: '1020',
          descripcion: 'Vive una experiencia saludable con nuestro DoyPack IO Hierbas. Este producto único está especialmente formulado con una selección premium de hierbas, brindándote un sabor inigualable y beneficios para tu salud.',
          urlImg: 'assets/img/cuidado_capilar/Acond. DoyPack IO Hierbas 1000ml.jpg',
        },
        {
          id:3,
          nombre: 'Shampoo DoyPack IO Huevo 1000ml',
          precio: '1020',
          descripcion: 'Transfórmate en la mejor versión de ti con nuestro Shampoo DoyPack IO Quillay. Único en su clase, desenvuelve la magia de la naturaleza para darle vida y vigor a tu cabello.',
          urlImg: 'assets/img/cuidado_capilar/Shampoo DoyPack IO Huevo 1000ml.jpg',
        },
        {
          id:4,
          nombre: 'Shampoo DoyPack IO Quillay 1000ml',
          precio: '1020',
          descripcion: 'Redefine tu cuidado del cabello con el Shampoo DoyPack IO Huevo. Nutre, revitaliza y protege tu cabello con intensidad gracias a su fórmula exclusiva con extractos de huevo.',
          urlImg: 'assets/img/cuidado_capilar/Shampoo DoyPack IO Quillay 1000ml.jpg',
        }
      ];
    }else if(this.seccion == 'cuidado_ropa'){
      return [
        {
          id:5,
          nombre: 'Jabon de Lavar barra Doña Tuti 170 grs',
          precio: '5000',
          descripcion: 'Jabón para Lavar en Barra Doña Tuti, poder de limpieza.',
          urlImg: 'assets/img/cuidado_ropa/Jabon de Lavar barra Doña Tuti 170 grs.jpg',
        },
        {
          id:6,
          nombre: 'Cloro Concentrado Briks 5 Lts',
          precio: '1899',
          descripcion: 'Disfrute de un hogar impecablemente limpio con el cloro líquido Briks. Este potente limpiador ofrece una desinfección y limpieza completa, eliminando efectivamente bacterias y suciedad.',
          urlImg: 'assets/img/cuidado_ropa/Cloro Concentrado Briks 5 Lts.jpg',
        },
        {
          id:7,
          nombre: 'Detergentes Briks Verde 5 Lts',
          precio: '3120',
          descripcion: 'Nunca antes tus prendas habían lucido tan bien. Introducimos Detergentes Briks Verde de 5 litros, tú solución definitiva para un lavado profundo y aromatizante.',
          urlImg: 'assets/img/cuidado_ropa/Detergentes Briks Verde 5 Lts.jpg',
        },
        {
          id:8,
          nombre: 'Suavizante Doña Tuti Aloe Vera 1000ml',
          precio: '1100',
          descripcion: 'Suavizante Doña Tuti Aloe Vera 1000ml.',
          urlImg: 'assets/img/cuidado_ropa/Suavizante Doña Tuti Aloe Vera 1000ml.jpg',
        }
      ];

    }else if(this.seccion == 'limpieza'){
      return [
        {
          id:9,
          nombre: 'Cloro Gel Briks Citrus 900ml',
          precio: '1050',
          descripcion: 'Dile adiós a las bacterias con Cloro Gel Briks Citrus. Potenciado con un fresco aroma a cítricos, este producto de limpieza multifuncional ofrece una solución poderosa a tu alcance.',
          urlImg: 'assets/img/Limpieza/Cloro Gel Briks Citrus 900ml.jpg',
        },
        {
          id:10,
          nombre: 'Lavaloza Verde Briks 2 Lts',
          precio: '1430',
          descripcion: 'Revitaliza y da vida a tus platos con Lavaloza Verde Briks. Este detergente innovador no solo limpia a profundidad, sino que también cuida de tus manos, gracias a su formula exclusiva.',
          urlImg: 'assets/img/Limpieza/Lavaloza Verde Briks 2 Lts.jpg',
        },
        {
          id:11,
          nombre: 'Trapero Humedo Doña Tuti Lavanda 40x60cm',
          precio: '1799',
          descripcion: 'Trapero Humedo Doña Tuti Lavanda 40x60cm.',
          urlImg: 'assets/img/Limpieza/Trapero Humedo Doña Tuti Lavanda 40x60cm.jpg',
        },
        {
          id:12,
          nombre: 'Lavalozas Briks Verde 5 Lts',
          precio: '3120',
          descripcion: 'Como por arte de magia. Esta solución líquida es potente y eficaz, eliminando todo tipo de suciedad adherida en los platos y utensilios de cocina. Su fórmula única, biodegradable, respeta el medio ambiente, mientras garantiza la limpieza profunda que usted necesita.',
          urlImg: 'assets/img/Limpieza/Lavalozas Briks Verde 5 Lts.jpg',
        }
      ];
    }else{
      return [
        {
          id:13,
          nombre: 'Toalla de papel Nobby Fit',
          precio: '680',
          descripcion: 'Toalla de papel Bobby Fit',
          urlImg: 'assets/img/papel/Toalla de papel Nobby Fit.jpg',
        },
        {
          id:14,
          nombre: 'Servilleta Doña Tuti (Premium)',
          precio: '1290',
          descripcion: '300 Unidades por Paquete',
          urlImg: 'assets/img/papel/Servilleta Doña Tuti (Pack Familiar Premium).jpg',
        },
        {
          id:15,
          nombre: 'Papel Higiénico Top One 20mts (Pack 12r)',
          precio: '2499',
          descripcion: 'Papel Higiénico Top One 20 metros, pack de 12 rollos.',
          urlImg: 'assets/img/papel/Papel Higiénico Top One 20mts (Pack 12r).jpg',
        },
        {
          id:16,
          nombre: 'Toalla Mediana HiperMax XL Doble Hoja',
          precio: '2580',
          descripcion: 'Toalla HiperMax XL Doble Hoja 100 Mts',
          urlImg: 'assets/img/papel/Toalla Mediana HiperMax XL Doble Hoja.jpg',
        }
      ];
    }
  }

  /**
   * Inicializa los formularios para cada producto con los datos actuales.
   */
  inicializarFormularios(): void{
    this.productForms = {};
    this.products.forEach((product) => {
      this.productForms[product.id] = this.fb.group({
        nombre: [product.nombre, Validators.required],
        precio: [product.precio, [Validators.required]],
        descripcion: [product.descripcion, Validators.required],
        tipoProducto: [product.tipoProducto, Validators.required],
        imagen: [null ]
      });
    });

    this.crearProdcutoForm = this.fb.group({
      nombreProducto: ['', Validators.required],
      precioProducto: ['', Validators.required],
      tipoProducto: [this.seccion, Validators.required],
      descripcionProducto: ['', Validators.required],
      imagenProducto: [null]
    });
  }

  /**
   * Permite visualizar el modal definido
   */
  abrirModal(): void {
    this.modalInstance.show();
  }

/**
/**
 * Maneja el envío de un formulario para actualizar un producto.
 * @param form - El formulario del producto que se está editando.
 * @param product - El producto correspondiente al formulario.
 */
async onSubmit(form: FormGroup, product: Producto): Promise<void> {
  if (form.valid) {
    const updatedProduct = form.value;
    product.nombre = updatedProduct.nombre;
    product.precio = updatedProduct.precio;
    product.descripcion = updatedProduct.descripcion;
    product.tipoProducto = updatedProduct.tipoProducto;
    product.urlImg = "assets/img/placeholder.jpg";
    const file = form.get('imagen')?.value;
    // if (file instanceof File) {
    //   const url = await this.guardarImagenStorage(file);
    //   product.urlImg = url;
    // }

    this.productoService.actualizarProducto(product.id, product, this.seccion).subscribe(() => {
      this.inicializarProductos();
      alert('La información del producto ha sido actualizada correctamente.');
    }, error => {
      console.error('Error al actualizar el producto:', error);
      alert('Hubo un error al actualizar el producto.');
    });
  } else {
    alert('Por favor, complete todos los campos correctamente.');
  }
}
/**
 * Eliminar un producto seleccionado.
 * @param event - Evento de eliminación
 * @param producto - Producto a eliminar
 */
eliminar(event: Event, producto: Producto): void {
  event.preventDefault();

  this.productoService.eliminarProducto(producto.id, this.seccion).subscribe({
    next: () => {
      this.inicializarProductos();
      alert("Producto eliminado exitosamente");
      console.log("Producto eliminado exitosamente");
    },
    error: (error) => {
      console.error('Error al eliminar el producto:', error);
      alert('Hubo un error al eliminar el producto.');
    }
  });
}

/**
 * Encargado de manejar la creación de un nuevo producto.
 */
async submitForm(): Promise<void> {
  if (this.crearProdcutoForm.valid) {
    const file = this.crearProdcutoForm.get('imagenProducto')?.value;
    if (file instanceof File) {
      // const url = await this.guardarImagenStorage(file);

      const nuevoProducto: Producto = {
        id: this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1,
        nombre: this.crearProdcutoForm.get('nombreProducto')?.value,
        precio: this.crearProdcutoForm.get('precioProducto')?.value,
        tipoProducto: this.crearProdcutoForm.get('tipoProducto')?.value,
        descripcion: this.crearProdcutoForm.get('descripcionProducto')?.value,
        urlImg: "assets/img/placeholder.jpg"
      };

      this.productoService.agregarProducto(nuevoProducto, this.seccion).subscribe(() => {
        this.inicializarProductos();
        alert("Producto Creado Exitosamente");
        this.modalInstance.hide();
      }, error => {
        console.error('Error al crear el producto:', error);
        alert('Hubo un error al crear el producto.');
      });
    } else {
      alert("Favor de subir una imagen para el producto");
    }
  } else {
    alert('Favor de ingresar los campos obligatorios');
  }
}

  /**
   * Cuando se cambia un input file, se toma el valor y lo setea al campo imagen
   * @param event - Variable de evento
   * @param productId - Id del producto a editar
   */
  onFileChange(event: Event, productId: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.productForms[productId].get('imagen')?.setValue(file);
    
    }
  }

  /**
   * Cuando se cambia un input file, se toma el valor y lo setea al campo imagen producto
   * Solo ocurre en la creación
   * @param event - Variable de evento
   */
  onFileChangeCreate(event: Event): void { 
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.crearProdcutoForm.get('imagenProducto')?.setValue(file);
    
    }
  }


  
/**
 * Formatea un numero con el formato de peso chileno
 * 
 * @param x 
 * @returns 
 */
  numberWithCommas(x: string): string {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

}
