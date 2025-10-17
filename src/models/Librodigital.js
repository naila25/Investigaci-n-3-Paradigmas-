import { Libro } from "./Libro.js";

export class LibroDigital extends Libro {
  constructor(titulo, autor, anio, formato) {
    super(titulo, autor, anio);
    this.formato = formato;
    this.prestadosA = []; // Lista de usuarios
  }

  prestar(usuario) {
    this.prestadosA.push(usuario);
    return true; // Siempre se puede prestar
  }

  devolver(usuario) {
    // Opc: quitar un usuario si quieres
    this.prestadosA = this.prestadosA.filter(u => u.email !== usuario.email);
    return true;
  }

  info() {
    const nombres = this.prestadosA.map(u => u.nombre).join(", ");
    return `${this.titulo} - ${this.autor} - Año: ${this.anio} - Formato: ${this.formato} - Estado: Disponible - Prestado a: ${nombres}`;
  }
}



