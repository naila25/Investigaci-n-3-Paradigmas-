
export class Libro {
  constructor(titulo, autor, anio) {
    this.titulo = titulo;
    this.autor = autor;
    this.anio = anio;
    this.disponible = true;
  }

  prestar() {
    if (this.disponible) {
      this.disponible = false;
      return true;
    }
    return false;
  }

  devolver() {
    this.disponible = true;
  }

  estado() {
    return this.disponible ? "Disponible" : "Prestado";
  }
}
