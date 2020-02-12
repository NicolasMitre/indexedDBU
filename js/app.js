let DB;

const form = document.querySelector("form"),
  nombreMascota = document.querySelector("#mascota"),
  nombreCliente = document.querySelector("#cliente"),
  telefono = document.querySelector("#telefono"),
  fecha = document.querySelector("#fecha"),
  hora = document.querySelector("#hora"),
  sintomas = document.querySelector("#sintomas"),
  citas = document.querySelector("#citas"),
  headingAdministra = document.querySelector("#administra");

document.addEventListener("DOMContentLoaded", () => {
  let crearDB = window.indexedDB.open("citas", 1);

  crearDB.onerror = function() {
    console.log("hubo un error");
  };

  crearDB.onsuccess = function() {
    DB = crearDB.result;
    mostrarCitas();
  };

  crearDB.onupgradeneeded = function(e) {
    let db = e.target.result;

    let objectStore = db.createObjectStore("citas", {
      keyPath: "key",
      autoIncrement: true
    });

    objectStore.createIndex("mascota", "mascota", { unique: false });
    objectStore.createIndex("cliente", "cliente", { unique: false });
    objectStore.createIndex("telefono", "telefono", { unique: false });
    objectStore.createIndex("fecha", "fecha", { unique: false });
    objectStore.createIndex("hora", "hora", { unique: false });
    objectStore.createIndex("sintomas", "sintomas", { unique: false });
  };
  form.addEventListener("submit", agregarDatos);

  function agregarDatos(e) {
    e.preventDefault();

    const nuevaCita = {
      mascota: nombreMascota.value,
      cliente: nombreCliente.value,
      telefono: telefono.value,
      fecha: fecha.value,
      hora: hora.value,
      sintomas: sintomas.value
    };

    let transaction = DB.transaction(["citas"], "readwrite");
    let objectStore = transaction.objectStore("citas");
    // console.log(objectStore);
    let peticion = objectStore.add(nuevaCita);
    console.log(peticion);

    peticion.onsuccess = () => {
      form.reset();
    };

    transaction.oncomplete = () => {
      console.log("completo");
      mostrarCitas();
    };
    transaction.onerror = () => {
      console.log("ERROR");
    };
  }
  function mostrarCitas() {
    // while (citas.firstChild) {
    //   citas.removeChild();
    // }
    let objectStore = DB.transaction("citas").objectStore("citas");

    objectStore.openCursor().onsuccess = function(e) {
      let cursor = e.target.result;
      if (cursor) {
        let citaHTML = document.createElement("li");
        citaHTML.setAttribute("data-cita-id", cursor.value.key);
        citaHTML.classList.add("list-group-item");

        citaHTML.innerHTML = `
        <p class="font-weight-bold"> Mascota: <span class="font-weight-normal"> ${cursor.value.mascota} </span> </p>
        <p class="font-weight-bold"> Cliente: <span class="font-weight-normal"> ${cursor.value.cliente} </span> </p>
        <p class="font-weight-bold"> Telefono: <span class="font-weight-normal"> ${cursor.value.telefono} </span> </p>
        <p class="font-weight-bold"> Fecha: <span class="font-weight-normal"> ${cursor.value.fecha} </span> </p>
        <p class="font-weight-bold"> Hora: <span class="font-weight-normal"> ${cursor.value.hora} </span> </p>
        <p class="font-weight-bold"> Sintomas: <span class="font-weight-normal"> ${cursor.value.sintomas} </span> </p>
        `;

        const botonBorrar = document.createElement("button");
        botonBorrar.classList.add("borrar", "btn", "btn-danger");
        botonBorrar.innerHTML = '<span aria-hidden="true"> X </span> Borrar';
        botonBorrar.onclick = borrarCita;
        citaHTML.appendChild(botonBorrar);
        citas.appendChild(citaHTML);

        cursor.continue();
      } else {
        if (!citas.firstChild) {
          headingAdministra.textContent = "Agrega citas para comenzar";
          let listado = document.createElement("p");
          listado.classList.add("text-center");
          listado.textContent = "No hay registros";
          citas.appendChild(listado);
        } else {
          headingAdministra.textContent = "Administra tus citas";
        }
      }
    };
  }
  function borrarCita(e) {
    let citaId = Number(e.target.parentElement.getAttribute("data-cita-id"));

    let transaction = DB.transaction(["citas"], "readwrite");
    let objectStore = transaction.objectStore("citas");
    // console.log(objectStore);
    let peticion = objectStore.delete(citaId);
    transaction.oncomplete = () => {
      e.target.parentElement.parentElement.removeChild(e.target.parentElement);
    };

    if (!citas.firstChild) {
      headingAdministra.textContent = "Agrega citas para comenzar";
      let listado = document.createElement("p");
      listado.classList.add("text-center");
      listado.textContent = "No hay registros";
      citas.appendChild(listado);
    } else {
      headingAdministra.textContent = "Administra tus citas";
    }
  }
});
