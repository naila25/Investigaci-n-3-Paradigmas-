// src/js/app.js
import { Libro } from "../models/Libro.js";
import { LibroDigital } from "../models/Librodigital.js";
import { Biblioteca } from "../models/Biblioteca.js";
import { Usuario } from "../models/Usuario.js";

const biblioteca = new Biblioteca();

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
    tituloPagina.textContent = "👤 Registrar Usuario";
  } else if (seccion === "ver") {
    seccionVerLibros.classList.remove("hidden");
    tituloPagina.textContent = "👁 Ver Libros";
    mostrarLibros();
  }
}

function volver() {
  vistaContenido.classList.add("hidden");
  vistaRoles.classList.remove("hidden");
  limpiarFormularios();
}

function limpiarFormularios() {
  inputTitulo.value = "";
  inputAutor.value = "";
  inputAnio.value = "";
  inputFormato.value = "";
  inputNombre.value = "";
  inputEmail.value = "";
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

// --- 2) Agregar libro ---
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

  let nuevoLibro;
  if (tipo === "digital") {
    if (!formato) {
      alert("⚠️ Debe indicar el formato del libro digital.");
      return;
    }
    nuevoLibro = new LibroDigital(titulo, autor, anio, formato);
  } else {
    nuevoLibro = new Libro(titulo, autor, anio);
  }

  biblioteca.agregarLibro(nuevoLibro);
  alert(`✅ "${titulo}" fue agregado a la biblioteca.`);

  limpiarFormularios();
  actualizarEstadoFormato();
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
    alert(`✅ "${nombre}" fue registrado como usuario.`);
    limpiarFormularios();
  } else {
    alert("⚠️ El email ya está registrado.");
  }
});

// --- 4) Mostrar libros ---
function mostrarLibros() {
  listaLibros.innerHTML = "";
  const libros = biblioteca.obtenerLibros();
  const usuarios = biblioteca.obtenerUsuarios();

  if (!libros || libros.length === 0) {
    listaLibros.innerHTML = `<p class="text-gray-500 text-center text-lg">No hay libros registrados.</p>`;
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
        <th class="py-3 px-4 text-center">Acción</th>
      </tr>
    </thead>
    <tbody id="tablaCuerpo"></tbody>
  `;

  const cuerpo = tabla.querySelector("#tablaCuerpo");

  libros.forEach((libro, index) => {
    const fila = document.createElement("tr");
    fila.className = "border-t hover:bg-blue-50 transition";

    let botonHTML = "";
    
    if (libro.estado === "Disponible") {
      if (usuarios.length > 0) {
        let selectUsuarios = `<select id="selectUsuario${index}" class="border p-1 rounded text-sm">
          <option value="">Seleccionar usuario</option>`;
        usuarios.forEach((usuario, uIndex) => {
          selectUsuarios += `<option value="${uIndex}">${usuario.nombre}</option>`;
        });
        selectUsuarios += `</select>`;
        
        botonHTML = `
          ${selectUsuarios}
          <button data-index="${index}" class="btnPrestar bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition mt-2">
            ✅ Prestar
          </button>
        `;
      } else {
        botonHTML = `<span class="text-gray-500 text-sm">No hay usuarios</span>`;
      }
    } else {
      botonHTML = `
        <button data-index="${index}" class="btnDevolver bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition">
          🔄 Devolver
        </button>
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
        <div class="flex flex-col items-center gap-2">
          ${botonHTML}
        </div>
      </td>
    `;

    cuerpo.appendChild(fila);
  });

  listaLibros.appendChild(tabla);

  // Escuchar clics en botones de prestar
  document.querySelectorAll(".btnPrestar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      const selectUsuario = document.getElementById(`selectUsuario${index}`);
      const indexUsuario = selectUsuario.value;

      if (!indexUsuario) {
        alert("⚠️ Selecciona un usuario.");
        return;
      }

      const usuario = usuarios[indexUsuario];
      const resultado = biblioteca.prestarLibro(index, usuario);

      if (resultado.exito) {
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
      const index = e.target.dataset.index;
      const resultado = biblioteca.devolverLibro(index);

      if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}`);
        mostrarLibros();
      } else {
        alert(`⚠️ ${resultado.mensaje}`);
      }
    });
  });
}