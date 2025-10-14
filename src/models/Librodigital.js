
import { Libro } from "./Libro.js";

export class LibroDigital extends Libro {
  constructor(titulo, autor, formato) {
    super(titulo, autor);
    this.formato = formato;
  }

  info() {
    return `${this.titulo} - ${this.autor} (${this.formato})`;
  }
}
