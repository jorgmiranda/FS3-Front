import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Usuario } from '../model/usuario';

/**
 * Servicio para gestionar operaciones CRUD de usuarios desde sessionStorage.
 */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  /**
   * Clave para almacenar usuarios en sessionStorage.
   */
  private storageKey = 'usuarios';

  constructor() {}

  /**
   * Obtiene la lista de todos los usuarios desde sessionStorage.
   * @returns Un Observable con la lista de usuarios.
   */
  obtenerTodosLosUsuarios(): Observable<Usuario[]> {
    const usuarios = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    return of(usuarios);
  }

  /**
   * Obtiene un usuario por su ID desde sessionStorage.
   * @param id ID del usuario a obtener.
   * @returns Un Observable con el usuario correspondiente al ID.
   */
  obtenerUsuarioPorId(id: number): Observable<Usuario | null> {
    const usuarios: Usuario[] = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    const usuario = usuarios.find(u => u.id === id);
    return of(usuario || null);
  }

  /**
   * Agrega un nuevo usuario en sessionStorage.
   * @param usuario Objeto usuario a agregar.
   * @returns Un Observable con el usuario agregado.
   */
  agregarUsuario(usuario: Usuario): Observable<Usuario> {
    const usuarios: Usuario[] = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    usuarios.push(usuario);
    sessionStorage.setItem(this.storageKey, JSON.stringify(usuarios));
    return of(usuario);
  }

  /**
   * Actualiza un usuario existente en sessionStorage.
   * @param id ID del usuario a actualizar.
   * @param usuario Objeto usuario con los nuevos datos.
   * @returns Un Observable con el usuario actualizado.
   */
  actualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    const usuarios: Usuario[] = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    const index = usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      usuarios[index] = usuario;
      sessionStorage.setItem(this.storageKey, JSON.stringify(usuarios));
    }
    return of(usuario);
  }

  /**
   * Elimina un usuario por su ID en sessionStorage.
   * @param id ID del usuario a eliminar.
   * @returns Un Observable vacío que indica la eliminación.
   */
  eliminarUsuario(id: number): Observable<void> {
    const usuarios: Usuario[] = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    const updatedUsuarios = usuarios.filter(u => u.id !== id);
    sessionStorage.setItem(this.storageKey, JSON.stringify(updatedUsuarios));
    return of(void 0);
  }
}
