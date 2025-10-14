// src/models/Biblioteca.js
export class Biblioteca {
  constructor() {
    this.libros = [];
    this.usuarios = [];
  }

  agregarLibro(libro) {
    this.libros.push(libro);
  }

  obtenerLibros() {
    return this.libros;
  }

  listarLibros() {
    return this.obtenerLibros();
  }

  // ===== GESTIÓN DE USUARIOS =====
  agregarUsuario(usuario) {
    const existe = this.usuarios.some(u => u.email === usuario.email);
    if (!existe) {
      this.usuarios.push(usuario);
      return true;
    }
    return false;
  }

  obtenerUsuario(email) {
    return this.usuarios.find(u => u.email === email);
  }

  obtenerUsuarios() {
    return this.usuarios;
  }

  // ===== GESTIÓN DE PRÉSTAMOS =====
  prestarLibro(indexLibro, usuario) {
    // Validaciones
    if (!usuario.puedePrestar()) {
      return { exito: false, mensaje: "El usuario ya tiene 2 préstamos activos." };
    }

    if (this.libros[indexLibro].estado !== "Disponible") {
      return { exito: false, mensaje: "El libro no está disponible." };
    }

    // Realizar préstamo
    this.libros[indexLibro].prestar(usuario);
    usuario.agregarPrestamo(this.libros[indexLibro], new Date().toLocaleDateString('es-ES'));

    return { exito: true, mensaje: `"${this.libros[indexLibro].titulo}" prestado a ${usuario.nombre}` };
  }

  devolverLibro(indexLibro) {
    const libro = this.libros[indexLibro];
    
    if (libro.estado !== "Prestado") {
      return { exito: false, mensaje: "El libro no está prestado." };
    }

    const usuario = libro.prestadoA;
    libro.devolver();

    if (usuario) {
      const indexPrestamo = usuario.prestamos.findIndex(p => p.libro === libro && p.estado === "activo");
      if (indexPrestamo !== -1) {
        usuario.devolverPrestamo(indexPrestamo);
      }
    }

    return { exito: true, mensaje: `"${libro.titulo}" ha sido devuelto.` };
  }
}