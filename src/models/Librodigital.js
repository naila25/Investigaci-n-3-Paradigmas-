import { Libro } from "./Libro.js";

export class LibroDigital extends Libro { // Hereda de Libro
  constructor(titulo, autor, anio, formato) {
    super(titulo, autor, anio); // Llama al constructor de la clase padre
    this.formato = formato;     // Agrega nueva propiedad
    this.prestadosA = []; // Lista de usuarios
  }

  //polimorfismo
  prestar(usuario) {
    this.prestadosA.push(usuario); // ← MÚLTIPLES usuarios
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



