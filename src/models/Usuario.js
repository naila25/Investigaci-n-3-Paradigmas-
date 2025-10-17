// src/models/Usuario.js
export class Usuario {
  constructor(nombre, email) { // Atributos encapsulados
    this.nombre = nombre;
    this.email = email;
    this.prestamos = []; // Array de objetos {libro, estado}
  }

  agregarPrestamo(libro) {
    this.prestamos.push({
      libro: libro,
      estado: "activo"
    });
  }

  devolverPrestamo(indexPrestamo) {
    if (this.prestamos[indexPrestamo]) {
      this.prestamos[indexPrestamo].estado = "devuelto";
      return true;
    }
    return false;
  }

  obtenerPrestamosActivos() {
    return this.prestamos.filter(p => p.estado === "activo");
  }

  obtenerTodosPrestamos() {
    return this.prestamos;
  }

//ABSTRACCIÓN
  puedePrestar() {
     // Internamente: filtra los préstamos activos, cuenta cuántos son, y compara con el límite de 2

    return this.obtenerPrestamosActivos().length < 2; // ← La regla está aquí maximo solo 2 libros puede prestar
  }

  info() {
    return `${this.nombre} (${this.email}) - Préstamos activos: ${this.obtenerPrestamosActivos().length}`;
  }
}