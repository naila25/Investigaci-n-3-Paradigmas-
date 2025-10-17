
export class Usuario {
  constructor(nombre, email) {
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

  puedePrestar() {
    return this.obtenerPrestamosActivos().length < 2;
  }

  info() {
    return `${this.nombre} (${this.email}) - Préstamos activos: ${this.obtenerPrestamosActivos().length}`;
  }
}