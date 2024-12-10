import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../model/usuario';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;

  const dummyUsuarios: Usuario[] = [
    { id: 1, nombreCompleto: 'Juan', correoUsuario: 'juan@example.com' , contrasena: '123.pass', rol: 'Usuario', fechaNacimiento: '12-03-1997', nombreUsuario:'juanito', direccionDespacho:'Calle 123', sesionIniciada: false },
    { id: 2, nombreCompleto: 'Ana', correoUsuario: 'ana@example.com', contrasena: '123.pass', rol: 'Usuario', fechaNacimiento: '12-03-1997', nombreUsuario:'anita', direccionDespacho:'Calle 123', sesionIniciada: false }
  ];

  const dummyUsuario: Usuario = { id: 1, nombreCompleto: 'Juan', correoUsuario: 'juan@example.com' , contrasena: '123.pass', rol: 'Usuario', fechaNacimiento: '12-03-1997', nombreUsuario:'juanito', direccionDespacho:'Calle 123', sesionIniciada: false };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsuarioService],
    });

    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes HTTP pendientes.
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener todos los usuarios', () => {
    service.obtenerTodosLosUsuarios().subscribe((usuarios) => {
      expect(usuarios.length).toBe(2);
      expect(usuarios).toEqual(dummyUsuarios);
    });

    const req = httpMock.expectOne('http://localhost:8082/usuarios');
    expect(req.request.method).toBe('GET');
    req.flush(dummyUsuarios);
  });

  it('debería obtener un usuario por ID', () => {
    service.obtenerUsuarioPorId(1).subscribe((usuario) => {
      expect(usuario).toEqual(dummyUsuario);
    });

    const req = httpMock.expectOne('http://localhost:8082/usuarios/1');
    expect(req.request.method).toBe('GET');
    req.flush(dummyUsuario);
  });

  it('debería agregar un nuevo usuario', () => {
    const nuevoUsuario: Usuario = { id: 3, nombreCompleto: 'Pedro', correoUsuario: 'pedro@example.com' , contrasena: '123.pass', rol: 'Usuario', fechaNacimiento: '12-03-1997', nombreUsuario:'juanito', direccionDespacho:'Calle 123', sesionIniciada: false };

    service.agregarUsuario(nuevoUsuario).subscribe((usuario) => {
      expect(usuario).toEqual(nuevoUsuario);
    });

    const req = httpMock.expectOne('http://localhost:8082/usuarios');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevoUsuario);
    req.flush(nuevoUsuario);
  });

  it('debería actualizar un usuario', () => {
    const usuarioActualizado: Usuario = { id: 1, nombreCompleto: 'Juan', correoUsuario: 'juan_actulizado@example.com' , contrasena: '123.pass', rol: 'Usuario', fechaNacimiento: '12-03-1997', nombreUsuario:'juanito', direccionDespacho:'Calle 123', sesionIniciada: false };

    service.actualizarUsuario(1, usuarioActualizado).subscribe((usuario) => {
      expect(usuario).toEqual(usuarioActualizado);
    });

    const req = httpMock.expectOne('http://localhost:8082/usuarios/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(usuarioActualizado);
    req.flush(usuarioActualizado);
  });

  it('debería eliminar un usuario', () => {
    service.eliminarUsuario(1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8082/usuarios/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
