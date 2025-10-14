import { Libro } from "./Libro.js";

export class LibroDigital extends Libro {
  constructor(titulo, autor, anio, formato) {
    super(titulo, autor, anio);
    this.formato = formato;
  }

  info() {
    return `${this.titulo} - ${this.autor} - Año: ${this.anio} - Formato: ${this.formato} - Estado: ${this.estado}`;
  }
}
