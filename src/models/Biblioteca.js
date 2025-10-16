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

  // ===== ELIMINAR LIBRO =====
  eliminarLibro(indexLibro) {
    if (this.libros[indexLibro]) {
      const libroEliminado = this.libros[indexLibro];
      
      // Verificar si el libro está prestado
      if (libroEliminado.estado === "Prestado") {
        return { exito: false, mensaje: "No se puede eliminar un libro que está prestado" };
      }
      
      this.libros.splice(indexLibro, 1);
      return { exito: true, mensaje: `"${libroEliminado.titulo}" fue eliminado correctamente` };
    }
    return { exito: false, mensaje: "Libro no encontrado" };
  }

  // ===== ACTUALIZAR LIBRO =====
  actualizarLibro(indexLibro, datosActualizados) {
    if (this.libros[indexLibro]) {
      const libro = this.libros[indexLibro];
      
      // Actualizar solo los campos permitidos
      if (datosActualizados.titulo) libro.titulo = datosActualizados.titulo;
      if (datosActualizados.autor) libro.autor = datosActualizados.autor;
      if (datosActualizados.anio) libro.anio = datosActualizados.anio;
      if (datosActualizados.formato !== undefined) libro.formato = datosActualizados.formato;
      
      return { exito: true, mensaje: `"${libro.titulo}" fue actualizado correctamente` };
    }
    return { exito: false, mensaje: "Libro no encontrado" };
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
    usuario.agregarPrestamo(this.libros[indexLibro]);

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