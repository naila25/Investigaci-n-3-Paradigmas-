// src/models/Libro.js
export class Libro {
  constructor(titulo, autor, anio) {
    this.titulo = titulo;
    this.autor = autor;
    this.anio = anio;
    this.estado = "Disponible";
    this.prestadoA = null; // Usuario que tiene el libro
    this.fechaPrestamo = null; // Fecha en que se prestó
  }

  prestar(usuario) {
    if (this.estado === "Disponible") {
      this.estado = "Prestado";
      this.prestadoA = usuario;
      this.fechaPrestamo = new Date().toLocaleDateString('es-ES');
      return true;
    }
    return false;
  }

  devolver() {
    this.estado = "Disponible";
    this.prestadoA = null;
    this.fechaPrestamo = null;
    return true;
  }

  cambiarEstado() {
    this.estado = this.estado === "Disponible" ? "Prestado" : "Disponible";
  }

  info() {
    return `${this.titulo} - ${this.autor} (${this.anio}) - Estado: ${this.estado}`;
  }
}