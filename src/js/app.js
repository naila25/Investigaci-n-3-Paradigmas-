// src/js/app.js
import { Libro } from "../models/Libro.js";
import { LibroDigital } from "../models/Librodigital.js";
import { Biblioteca } from "../models/Biblioteca.js";
import { Usuario } from "../models/Usuario.js";

const biblioteca = new Biblioteca();

// --- FUNCIONES DE LOCALSTORAGE ---
function guardarEnLocalStorage() {
  const datos = {
    libros: biblioteca.obtenerLibros().map(libro => ({
      titulo: libro.titulo,
      autor: libro.autor,
      anio: libro.anio,
      formato: libro.formato || null,
      estado: libro.estado,
      prestadoA: libro.prestadoA ? libro.prestadoA.email : null
    })),
    usuarios: biblioteca.obtenerUsuarios().map(usuario => ({
      nombre: usuario.nombre,
      email: usuario.email,
      prestamos: usuario.prestamos.map(prestamo => ({
        libroTitulo: prestamo.libro.titulo,
        estado: prestamo.estado
      }))
    }))
  };
  
  localStorage.setItem('bibliotecaData', JSON.stringify(datos));
}

function cargarDesdeLocalStorage() {
  const datosGuardados = localStorage.getItem('bibliotecaData');
  
  if (!datosGuardados) return;
  
  try {
    const datos = JSON.parse(datosGuardados);
    
    // Cargar usuarios primero
    datos.usuarios.forEach(usuarioData => {
      const usuario = new Usuario(usuarioData.nombre, usuarioData.email);
      biblioteca.agregarUsuario(usuario);
    });
    
    // Cargar libros
    datos.libros.forEach(libroData => {
      let libro;
      if (libroData.formato) {
        libro = new LibroDigital(libroData.titulo, libroData.autor, libroData.anio, libroData.formato);
      } else {
        libro = new Libro(libroData.titulo, libroData.autor, libroData.anio);
      }
      
      biblioteca.agregarLibro(libro);
      
      // Restaurar el estado de préstamo si existe
      if (libroData.estado === "Prestado" && libroData.prestadoA) {
        const usuario = biblioteca.obtenerUsuario(libroData.prestadoA);
        if (usuario) {
          libro.prestar(usuario);
          usuario.agregarPrestamo(libro);
        }
      }
    });
    
    // Restaurar préstamos devueltos en el historial
    datos.usuarios.forEach((usuarioData, index) => {
      const usuario = biblioteca.obtenerUsuarios()[index];
      usuarioData.prestamos.forEach(prestamoData => {
        if (prestamoData.estado === "devuelto") {
          const libro = biblioteca.obtenerLibros().find(l => l.titulo === prestamoData.libroTitulo);
          if (libro) {
            const yaExiste = usuario.prestamos.some(p => p.libro.titulo === libro.titulo);
            if (!yaExiste) {
              usuario.prestamos.push({
                libro: libro,
                estado: "devuelto"
              });
            }
          }
        }
      });
    });
    
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
}

// Cargar datos al inicio
cargarDesdeLocalStorage();

// --- ELEMENTOS DEL DOM ---
const vistaRoles = document.getElementById("vistaRoles");
const vistaContenido = document.getElementById("vistaContenido");
const btnVolver = document.getElementById("btnVolver");
const tituloPagina = document.getElementById("tituloPagina");

const seccionAgregarLibro = document.getElementById("seccionAgregarLibro");
const seccionRegistroUsuario = document.getElementById("seccionRegistroUsuario");
const seccionVerLibros = document.getElementById("seccionVerLibros");

// Campos del formulario de libros
const inputTitulo = document.getElementById("titulo");
const inputAutor = document.getElementById("autor");
const inputAnio = document.getElementById("anio");
const selectTipo = document.getElementById("tipo");
const inputFormato = document.getElementById("formato");

// Campos del formulario de usuario
const inputNombre = document.getElementById("nombre");
const inputEmail = document.getElementById("email");

// Botones
const btnAgregar = document.getElementById("btnAgregar");
const btnRegistrarUsuario = document.getElementById("btnRegistrarUsuario");

// Elementos de las tarjetas de roles
const roleButtons = document.querySelectorAll(".role-button");

const listaLibros = document.getElementById("listaLibros");
const filtroLibros = document.getElementById("filtroLibros");
const filtroUsuarios = document.getElementById("filtroUsuarios");
const listaUsuarios = document.getElementById("listaUsuarios");

// Modal
const modalHistorial = document.getElementById("modalHistorial");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const contenidoHistorial = document.getElementById("contenidoHistorial");
const nombreUsuarioModal = document.getElementById("nombreUsuarioModal");

// Variables para almacenar datos actuales
let librosActuales = [];
let usuariosActuales = [];
let modoEdicion = false;
let indexLibroEditar = null;

// --- FUNCIONES DEL MODAL ---
function abrirModal(usuario) {
  nombreUsuarioModal.textContent = `Usuario: ${usuario.nombre} (${usuario.email})`;
  
  const prestamos = usuario.obtenerTodosPrestamos();
  
  if (prestamos.length === 0) {
    contenidoHistorial.innerHTML = `
      <p class="text-gray-500 text-center py-8">Este usuario no tiene préstamos registrados.</p>
    `;
  } else {
    let html = `
      <div class="space-y-3">
    `;
    
    prestamos.forEach((prestamo, index) => {
      const estadoClass = prestamo.estado === "activo" 
        ? "bg-green-100 text-green-800" 
        : "bg-gray-100 text-gray-600";
      const estadoTexto = prestamo.estado === "activo" ? "Activo 📖" : "Devuelto ✅";
      
      html += `
        <div class="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h4 class="font-bold text-lg text-gray-800">${prestamo.libro.titulo}</h4>
              <p class="text-gray-600 text-sm">Por: ${prestamo.libro.autor}</p>
              <p class="text-gray-500 text-xs mt-1">Año: ${prestamo.libro.anio}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-sm font-semibold ${estadoClass}">
              ${estadoTexto}
            </span>
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
    contenidoHistorial.innerHTML = html;
  }
  
  modalHistorial.classList.add("active");
}

function cerrarModal() {
  modalHistorial.classList.remove("active");
}

btnCerrarModal.addEventListener("click", cerrarModal);

// Cerrar modal al hacer clic fuera del contenido
modalHistorial.addEventListener("click", (e) => {
  if (e.target === modalHistorial) {
    cerrarModal();
  }
});

// --- FUNCIONES DE NAVEGACIÓN ---
function mostrarSeccion(seccion) {
  vistaRoles.classList.add("hidden");
  vistaContenido.classList.remove("hidden");
  
  seccionAgregarLibro.classList.add("hidden");
  seccionRegistroUsuario.classList.add("hidden");
  seccionVerLibros.classList.add("hidden");
  
  if (seccion === "agregar") {
    seccionAgregarLibro.classList.remove("hidden");
    tituloPagina.textContent = "➕ Agregar Libro";
  } else if (seccion === "registrar") {
    seccionRegistroUsuario.classList.remove("hidden");
    tituloPagina.textContent = "👤 Gestionar Usuarios";
    mostrarUsuarios();
  } else if (seccion === "ver") {
    seccionVerLibros.classList.remove("hidden");
    tituloPagina.textContent = "👁 Ver Libros";
    filtroLibros.value = "";
    mostrarLibros();
  }
}

function volver() {
  vistaContenido.classList.add("hidden");
  vistaRoles.classList.remove("hidden");
  limpiarFormularios();
  cancelarEdicion();
}

function limpiarFormularios() {
  inputTitulo.value = "";
  inputAutor.value = "";
  inputAnio.value = "";
  inputFormato.value = "";
  inputNombre.value = "";
  inputEmail.value = "";
  filtroLibros.value = "";
  filtroUsuarios.value = "";
}

function cancelarEdicion() {
  modoEdicion = false;
  indexLibroEditar = null;
  btnAgregar.textContent = "➕ Agregar Libro";
  btnAgregar.className = "bg-green-600 text-white px-6 py-3 rounded-lg w-full mt-4 hover:bg-green-700 transition font-semibold text-lg";
}

// --- EVENT LISTENERS PARA BOTONES DE ROLES ---
roleButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    if (index === 0) {
      mostrarSeccion("agregar");
    } else if (index === 1) {
      mostrarSeccion("ver");
    } else if (index === 2) {
      mostrarSeccion("registrar");
    }
  });
});

btnVolver.addEventListener("click", volver);

// --- 1) Lógica para habilitar/deshabilitar "formato" ---
function actualizarEstadoFormato() {
  if (selectTipo.value === "digital") {
    inputFormato.disabled = false;
    inputFormato.placeholder = "Formato (ej. PDF, EPUB)";
    inputFormato.classList.remove("bg-gray-200");
  } else {
    inputFormato.value = "";
    inputFormato.disabled = true;
    inputFormato.placeholder = "No aplica para libro físico";
    inputFormato.classList.add("bg-gray-200");
  }
}

actualizarEstadoFormato();
selectTipo.addEventListener("change", actualizarEstadoFormato);

// --- 2) Agregar o Actualizar libro ---
btnAgregar.addEventListener("click", () => {
  const titulo = inputTitulo.value.trim();
  const autor = inputAutor.value.trim();
  const anio = inputAnio.value.trim();
  const tipo = selectTipo.value;
  const formato = inputFormato.value.trim();

  if (!titulo || !autor || !anio) {
    alert("⚠️ Por favor complete todos los campos requeridos (Título, Autor, Año).");
    return;
  }

  if (modoEdicion) {
    // MODO EDICIÓN
    const datosActualizados = {
      titulo: titulo,
      autor: autor,
      anio: anio,
      formato: tipo === "digital" ? formato : null
    };

    const resultado = biblioteca.actualizarLibro(indexLibroEditar, datosActualizados);
    
    if (resultado.exito) {
      alert(`✅ ${resultado.mensaje}`);
      guardarEnLocalStorage();
      limpiarFormularios();
      cancelarEdicion();
      actualizarEstadoFormato();
    } else {
      alert(`⚠️ ${resultado.mensaje}`);
    }
  } else {
    // MODO AGREGAR
    if (tipo === "digital" && !formato) {
      alert("⚠️ Debe indicar el formato del libro digital.");
      return;
    }

    let nuevoLibro;
    if (tipo === "digital") {
      nuevoLibro = new LibroDigital(titulo, autor, anio, formato);
    } else {
      nuevoLibro = new Libro(titulo, autor, anio);
    }

    biblioteca.agregarLibro(nuevoLibro);
    guardarEnLocalStorage();
    alert(`✅ "${titulo}" fue agregado a la biblioteca.`);

    limpiarFormularios();
    actualizarEstadoFormato();
  }
});

// --- 3) Registrar Usuario ---
btnRegistrarUsuario.addEventListener("click", () => {
  const nombre = inputNombre.value.trim();
  const email = inputEmail.value.trim();

  if (!nombre || !email) {
    alert("⚠️ Por favor complete nombre y email.");
    return;
  }

  const nuevoUsuario = new Usuario(nombre, email);
  
  if (biblioteca.agregarUsuario(nuevoUsuario)) {
    guardarEnLocalStorage();
    alert(`✅ "${nombre}" fue registrado como usuario.`);
    inputNombre.value = "";
    inputEmail.value = "";
    mostrarUsuarios();
  } else {
    alert("⚠️ El email ya está registrado.");
  }
});

// --- 4) Mostrar libros ---
function mostrarLibros() {
  listaLibros.innerHTML = "";
  librosActuales = biblioteca.obtenerLibros();
  const usuarios = biblioteca.obtenerUsuarios();

  if (!librosActuales || librosActuales.length === 0) {
    listaLibros.innerHTML = `<p class="text-gray-500 text-center text-lg">No hay libros registrados.</p>`;
    return;
  }

  crearTablaLibros(librosActuales, usuarios);

  filtroLibros.removeEventListener("input", filtrarLibros);
  filtroLibros.addEventListener("input", filtrarLibros);
}

function crearTablaLibros(libros, usuarios) {
  listaLibros.innerHTML = "";
  
  if (libros.length === 0) {
    listaLibros.innerHTML = `<p class="text-gray-500 text-center text-lg">No se encontraron resultados.</p>`;
    return;
  }

  const tabla = document.createElement("table");
  tabla.className =
    "min-w-full border border-gray-300 bg-white shadow-lg rounded-lg overflow-hidden";

  tabla.innerHTML = `
    <thead class="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <tr>
        <th class="py-3 px-4 text-left">Título</th>
        <th class="py-3 px-4 text-left">Autor</th>
        <th class="py-3 px-4 text-left">Año</th>
        <th class="py-3 px-4 text-left">Tipo</th>
        <th class="py-3 px-4 text-left">Estado</th>
        <th class="py-3 px-4 text-left">Prestado a</th>
        <th class="py-3 px-4 text-center">Acciones</th>
      </tr>
    </thead>
    <tbody id="tablaCuerpo"></tbody>
  `;

  const cuerpo = tabla.querySelector("#tablaCuerpo");

  libros.forEach((libro, index) => {
    const indexReal = biblioteca.obtenerLibros().indexOf(libro);
    
    const fila = document.createElement("tr");
    fila.className = "border-t hover:bg-blue-50 transition";

    let botonesHTML = "";
    
    if (libro.estado === "Disponible") {
      if (usuarios.length > 0) {
        let selectUsuarios = `<select id="selectUsuario${indexReal}" class="border p-1 rounded text-sm mb-2">
          <option value="">Seleccionar usuario</option>`;
        usuarios.forEach((usuario, uIndex) => {
          selectUsuarios += `<option value="${uIndex}">${usuario.nombre}</option>`;
        });
        selectUsuarios += `</select>`;
        
        botonesHTML = `
          <div class="flex flex-col gap-2">
            ${selectUsuarios}
            <button data-index="${indexReal}" class="btnPrestar bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition">
              ✅ Prestar
            </button>
            <button data-index="${indexReal}" class="btnEditar bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition">
              ✏️ Editar
            </button>
            <button data-index="${indexReal}" class="btnEliminar bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition">
              🗑️ Eliminar
            </button>
          </div>
        `;
      } else {
        botonesHTML = `
          <div class="flex flex-col gap-2">
            <span class="text-gray-500 text-sm">No hay usuarios</span>
            <button data-index="${indexReal}" class="btnEditar bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition">
              ✏️ Editar
            </button>
            <button data-index="${indexReal}" class="btnEliminar bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition">
              🗑️ Eliminar
            </button>
          </div>
        `;
      }
    } else {
      botonesHTML = `
        <div class="flex flex-col gap-2">
          <button data-index="${indexReal}" class="btnDevolver bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition">
            🔄 Devolver
          </button>
          <button data-index="${indexReal}" class="btnEditar bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition">
            ✏️ Editar
          </button>
        </div>
      `;
    }

    fila.innerHTML = `
      <td class="py-3 px-4 font-semibold">${libro.titulo}</td>
      <td class="py-3 px-4">${libro.autor}</td>
      <td class="py-3 px-4">${libro.anio}</td>
      <td class="py-3 px-4">${libro.formato ? libro.formato : "Físico"}</td>
      <td class="py-3 px-4 font-semibold ${
        libro.estado === "Disponible" ? "text-green-600" : "text-red-600"
      }">${libro.estado}</td>
      <td class="py-3 px-4 text-sm">${libro.prestadoA ? libro.prestadoA.nombre : "-"}</td>
      <td class="py-3 px-4 text-center">
        ${botonesHTML}
      </td>
    `;

    cuerpo.appendChild(fila);
  });

  listaLibros.appendChild(tabla);

  // Escuchar clics en botones de prestar
  document.querySelectorAll(".btnPrestar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const indexReal = e.target.dataset.index;
      const usuarios = biblioteca.obtenerUsuarios();
      const selectUsuario = document.getElementById(`selectUsuario${indexReal}`);
      const indexUsuario = selectUsuario.value;

      if (!indexUsuario) {
        alert("⚠️ Selecciona un usuario.");
        return;
      }

      const usuario = usuarios[indexUsuario];
      const resultado = biblioteca.prestarLibro(indexReal, usuario);

      if (resultado.exito) {
        guardarEnLocalStorage();
        alert(`✅ ${resultado.mensaje}`);
        mostrarLibros();
      } else {
        alert(`⚠️ ${resultado.mensaje}`);
      }
    });
  });

  // Escuchar clics en botones de devolver
  document.querySelectorAll(".btnDevolver").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const indexReal = e.target.dataset.index;
      const resultado = biblioteca.devolverLibro(indexReal);

      if (resultado.exito) {
        guardarEnLocalStorage();
        alert(`✅ ${resultado.mensaje}`);
        mostrarLibros();
      } else {
        alert(`⚠️ ${resultado.mensaje}`);
      }
    });
  });

  // Escuchar clics en botones de editar
  document.querySelectorAll(".btnEditar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const indexReal = e.target.dataset.index;
      const libro = biblioteca.obtenerLibros()[indexReal];

      mostrarSeccion("agregar");

      inputTitulo.value = libro.titulo;
      inputAutor.value = libro.autor;
      inputAnio.value = libro.anio;
      
      if (libro.formato) {
        selectTipo.value = "digital";
        inputFormato.value = libro.formato;
      } else {
        selectTipo.value = "fisico";
      }
      
      actualizarEstadoFormato();

      modoEdicion = true;
      indexLibroEditar = indexReal;
      
      btnAgregar.textContent = "💾 Guardar Cambios";
      btnAgregar.className = "bg-blue-600 text-white px-6 py-3 rounded-lg w-full mt-4 hover:bg-blue-700 transition font-semibold text-lg";
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Escuchar clics en botones de eliminar
  document.querySelectorAll(".btnEliminar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const indexReal = e.target.dataset.index;
      const libro = biblioteca.obtenerLibros()[indexReal];

      if (confirm(`¿Estás seguro de eliminar "${libro.titulo}"?`)) {
        const resultado = biblioteca.eliminarLibro(indexReal);

        if (resultado.exito) {
          guardarEnLocalStorage();
          alert(`✅ ${resultado.mensaje}`);
          mostrarLibros();
        } else {
          alert(`⚠️ ${resultado.mensaje}`);
        }
      }
    });
  });
}

// Función de filtro para libros
function filtrarLibros(e) {
  const filtro = e.target.value.toLowerCase();
  const libros = biblioteca.obtenerLibros();
  const usuarios = biblioteca.obtenerUsuarios();
  
  const librosFiltrados = libros.filter(libro => 
    libro.titulo.toLowerCase().includes(filtro) || 
    libro.autor.toLowerCase().includes(filtro)
  );

  crearTablaLibros(librosFiltrados, usuarios);
}

// --- 5) Mostrar usuarios registrados con filtro ---
function mostrarUsuarios() {
  listaUsuarios.innerHTML = "";
  usuariosActuales = biblioteca.obtenerUsuarios();

  if (!usuariosActuales || usuariosActuales.length === 0) {
    listaUsuarios.innerHTML = `<p class="text-gray-500 text-center text-lg">No hay usuarios registrados.</p>`;
    return;
  }

  crearTablaUsuarios(usuariosActuales);

  filtroUsuarios.removeEventListener("input", filtrarUsuarios);
  filtroUsuarios.addEventListener("input", filtrarUsuarios);
}

function crearTablaUsuarios(usuarios) {
  listaUsuarios.innerHTML = "";
  
  if (usuarios.length === 0) {
    listaUsuarios.innerHTML = `<p class="text-gray-500 text-center text-lg">No se encontraron resultados.</p>`;
    return;
  }

  const tabla = document.createElement("table");
  tabla.className =
    "min-w-full border border-gray-300 bg-white shadow-lg rounded-lg overflow-hidden";

  tabla.innerHTML = `
    <thead class="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
      <tr>
        <th class="py-3 px-4 text-left">Nombre</th>
        <th class="py-3 px-4 text-left">Email</th>
        <th class="py-3 px-4 text-center">Préstamos Activos</th>
        <th class="py-3 px-4 text-center">Total Préstamos</th>
        <th class="py-3 px-4 text-center">Acciones</th>
      </tr>
    </thead>
    <tbody id="tablaUsuariosCuerpo"></tbody>
  `;

  const cuerpo = tabla.querySelector("#tablaUsuariosCuerpo");

  usuarios.forEach((usuario, index) => {
    const fila = document.createElement("tr");
    fila.className = "border-t hover:bg-purple-50 transition";

    const prestamosActivos = usuario.obtenerPrestamosActivos().length;
    const totalPrestamos = usuario.obtenerTodosPrestamos().length;

    fila.innerHTML = `
      <td class="py-3 px-4 font-semibold">${usuario.nombre}</td>
      <td class="py-3 px-4">${usuario.email}</td>
      <td class="py-3 px-4 text-center">
        <span class="bg-orange-200 text-orange-800 px-3 py-1 rounded-full">${prestamosActivos}/2</span>
      </td>
      <td class="py-3 px-4 text-center">
        <span class="bg-blue-200 text-blue-800 px-3 py-1 rounded-full">${totalPrestamos}</span>
      </td>
      <td class="py-3 px-4 text-center">
        <button data-index="${index}" class="btnVerHistorial bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition font-semibold">
          📖 Ver Historial
        </button>
      </td>
    `;

    cuerpo.appendChild(fila);
  });

  listaUsuarios.appendChild(tabla);

  // Escuchar clics en botones de ver historial
  document.querySelectorAll(".btnVerHistorial").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      const usuario = biblioteca.obtenerUsuarios()[index];
      abrirModal(usuario);
    });
  });
}

// Función de filtro para usuarios
function filtrarUsuarios(e) {
  const filtro = e.target.value.toLowerCase();
  const usuarios = biblioteca.obtenerUsuarios();
  
  const usuariosFiltrados = usuarios.filter(usuario => 
    usuario.nombre.toLowerCase().includes(filtro) || 
    usuario.email.toLowerCase().includes(filtro)
  );

  crearTablaUsuarios(usuariosFiltrados);
}