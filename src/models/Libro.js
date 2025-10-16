// src/models/Libro.js
export class Libro {
  constructor(titulo, autor, anio, cantidad = 1) {
    this.titulo = titulo;
    this.autor = autor;
    this.anio = anio;
    this.estado = cantidad > 0 ? "Disponible" : "Agotado"; // Estado según cantidad
    this.prestadoA = null; // Usuario que tiene el libro
    this.cantidad = cantidad; // Nueva propiedad
  }

  prestar(usuario) {
    if (this.cantidad > 0) {
      this.cantidad--; // Reducir cantidad
      this.prestadoA = usuario;
      this.estado = this.cantidad > 0 ? "Disponible" : "Agotado";
      return { exito: true, mensaje: `Libro prestado a ${usuario.nombre}` };
    }
    return { exito: false, mensaje: "No hay unidades disponibles" };
  }

  devolver() {
    this.cantidad++; // Aumentar cantidad
    this.estado = "Disponible";
    this.prestadoA = null;
    return { exito: true, mensaje: "Libro devuelto con éxito" };
  }

  cambiarEstado() {
    this.estado = this.estado === "Disponible" ? "Prestado" : "Disponible";
  }

  info() {
    return `${this.titulo} - ${this.autor} (${this.anio}) - Estado: ${this.estado} - Cantidad: ${this.cantidad}`;
  }
}
