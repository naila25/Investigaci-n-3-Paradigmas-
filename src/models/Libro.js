// src/models/Libro.js
export class Libro {
  constructor(titulo, autor, anio) {
    this.titulo = titulo;
    this.autor = autor;
    this.anio = anio;
    this.estado = "Disponible"; // 👈 nuevo atributo
  }

  // Método para prestar o devolver el libro
  cambiarEstado() {
    this.estado = this.estado === "Disponible" ? "Prestado" : "Disponible";
  }

  info() {
    return `${this.titulo} - ${this.autor} (${this.anio}) - Estado: ${this.estado}`;
  }
}
