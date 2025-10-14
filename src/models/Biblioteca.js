// src/models/Biblioteca.js
export class Biblioteca {
  constructor() {
    this.libros = [];
  }

  agregarLibro(libro) {
    this.libros.push(libro);
  }

  // Método público para obtener los libros (nombre claro)
  obtenerLibros() {
    return this.libros;
  }

  // si querés, también dejamos listarLibros() que llame al otro (opcional)
  listarLibros() {
    return this.obtenerLibros();
  }
}
