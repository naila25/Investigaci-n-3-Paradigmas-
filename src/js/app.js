// src/js/app.js
import { Libro } from "../models/Libro.js";
import { LibroDigital } from "../models/Librodigital.js";
import { Biblioteca } from "../models/Biblioteca.js";

const biblioteca = new Biblioteca();

const btnAgregar = document.getElementById("btnAgregar");
const btnMostrar = document.getElementById("btnMostrar");
const listaLibros = document.getElementById("listaLibros");

// Campos del formulario
const inputTitulo = document.getElementById("titulo");
const inputAutor = document.getElementById("autor");
const inputAnio = document.getElementById("anio");
const selectTipo = document.getElementById("tipo");
const inputFormato = document.getElementById("formato");

// --- 1) Lógica para habilitar/deshabilitar "formato" ---
function actualizarEstadoFormato() {
  if (selectTipo.value === "digital") {
    inputFormato.disabled = false;
    inputFormato.placeholder = "Formato (ej. PDF, EPUB)";
    inputFormato.classList.remove("bg-gray-200");
  } else {
    // Si es físico, deshabilitar y limpiar el campo formato
    inputFormato.value = "";
    inputFormato.disabled = true;
    inputFormato.placeholder = "No aplica para libro físico";
    // opcional: marcar visualmente deshabilitado
    inputFormato.classList.add("bg-gray-200");
  }
}

// Ejecutar al cargar la página y al cambiar el select
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

  // Limpiar campos
  inputTitulo.value = "";
  inputAutor.value = "";
  inputAnio.value = "";
  inputFormato.value = "";
  // Mantener el select como estaba o resetear si querés:
  // selectTipo.value = "fisico";
  actualizarEstadoFormato();
});

// --- 3) Mostrar libros (asegurarse de llamar al método correcto) ---
btnMostrar.addEventListener("click", () => {
  listaLibros.innerHTML = "";
  const libros = biblioteca.obtenerLibros();

  if (!libros || libros.length === 0) {
    listaLibros.innerHTML = `<p class="text-gray-500 text-center">No hay libros registrados.</p>`;
    return;
  }

  // Crear tabla
  const tabla = document.createElement("table");
  tabla.className = "min-w-full border border-gray-300 bg-white shadow-md rounded-lg overflow-hidden";

  // Encabezado de la tabla
  tabla.innerHTML = `
    <thead class="bg-gray-200 text-gray-700">
      <tr>
        <th class="py-2 px-4 text-left">Título</th>
        <th class="py-2 px-4 text-left">Autor</th>
        <th class="py-2 px-4 text-left">Año</th>
        <th class="py-2 px-4 text-left">Formato</th>
      </tr>
    </thead>
    <tbody id="tablaCuerpo"></tbody>
  `;

  const cuerpo = tabla.querySelector("#tablaCuerpo");

  // Rellenar la tabla con los libros
  libros.forEach((libro) => {
    const fila = document.createElement("tr");
    fila.className = "border-t hover:bg-gray-50 transition";

    fila.innerHTML = `
      <td class="py-2 px-4">${libro.titulo}</td>
      <td class="py-2 px-4">${libro.autor}</td>
      <td class="py-2 px-4">${libro.anio}</td>
      <td class="py-2 px-4">${libro.formato ? libro.formato : "Físico"}</td>
    `;

    cuerpo.appendChild(fila);
  });

  listaLibros.appendChild(tabla);
});
