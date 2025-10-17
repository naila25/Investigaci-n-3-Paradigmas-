// src/models/Libro.js
export class Libro {
  constructor(titulo, autor, anio) {
    this.titulo = titulo;
    this.autor = autor;
    this.anio = anio;
    this.estado = "Disponible";
    this.prestadoA = null; // Usuario que tiene el libro
  }

  prestar(usuario) {
    if (this.estado === "Disponible") {
      this.estado = "Prestado";
      this.prestadoA = usuario;
      return true;
    }
    return false;
  }

  devolver() {
    this.estado = "Disponible";
    this.prestadoA = null;
    return true;
  }

  cambiarEstado() {
    this.estado = this.estado === "Disponible" ? "Prestado" : "Disponible";
  }

  info() {
    return `${this.titulo} - ${this.autor} (${this.anio}) - Estado: ${this.estado}`;
  }
}