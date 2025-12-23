/* ===== USUARIOS ===== */
const usuarios = [
  {usuario:"admin", clave:"1234"},
  {usuario:"cajero", clave:"abcd"}
];
let usuarioActivo = null;

/* ===== PRODUCTOS ===== */
let productos = JSON.parse(localStorage.getItem("productos")) || [];

/* ===== CAJA ===== */
let caja = JSON.parse(localStorage.getItem("caja")) || {
  abierta:false, apertura:0, ventas:0, cierre:0, fecha:""
};
let historialCierres = JSON.parse(localStorage.getItem("historialCierres")) || [];

/* ===== HISTORIAL ===== */
let historial = JSON.parse(localStorage.getItem("historialCaja")) || [];

/* ===== CARRITO ===== */
let carrito = [];
let total = 0;

/* ===== LOGIN ===== */
function login(){
  const u = document.getElementById("usuario").value;
  const p = document.getElementById("clave").value;

  const valido = usuarios.find(user => user.usuario === u && user.clave === p);

  if(!valido){ 
    alert("Usuario o contraseña incorrectos"); 
    return; 
  }

  usuarioActivo = valido.usuario;
  document.getElementById("login").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  actualizarEstadoCaja();
}

/* ===== INVENTARIO ===== */
function abrirInventario(){ 
  document.getElementById("dashboard").classList.add("hidden"); 
  document.getElementById("inventario").classList.remove("hidden"); 
  actualizarLista(); 
}
function volver(){ 
  document.getElementById("inventario").classList.add("hidden"); 
  document.getElementById("dashboard").classList.remove("hidden"); 
}
function agregarProducto(){
  let nombre=document.getElementById("nombre").value;
  let precio=Number(document.getElementById("precio").value);
  let stock=Number(document.getElementById("stock").value);
  if(!nombre||!precio||!stock){ alert("Completa todos los campos"); return; }
  productos.push({nombre, precio, stock});
  localStorage.setItem("productos", JSON.stringify(productos));
  actualizarLista();
  document.getElementById("nombre").value="";
  document.getElementById("precio").value="";
  document.getElementById("stock").value="";
}
function actualizarLista(){
  let lista=document.getElementById("lista");
  lista.innerHTML="";
  productos.forEach(p=>{
    let li=document.createElement("li");
    li.textContent=`${p.nombre} - $${p.precio} - Stock: ${p.stock}`;
    lista.appendChild(li);
  });
}

/* ===== VENTAS ===== */
function abrirVentas(){
  if(!caja.abierta){ alert("Debes abrir la caja primero"); return; }
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("ventas").classList.remove("hidden");
  cargarProductosVenta();
}
function volverVentas(){ 
  document.getElementById("ventas").classList.add("hidden"); 
  document.getElementById("dashboard").classList.remove("hidden"); 
}
function cargarProductosVenta(){
  let select=document.getElementById("productoVenta"); select.innerHTML="";
  productos.forEach((p,i)=>{
    if(p.stock>0){
      let option=document.createElement("option");
      option.value=i;
      option.textContent=`${p.nombre} - $${p.precio} (Stock ${p.stock})`;
      select.appendChild(option);
    }
  });
}
function agregarAlCarrito(){
  let index=document.getElementById("productoVenta").value;
  let cantidad=Number(document.getElementById("cantidadVenta").value);
  if(cantidad<=0){ alert("Cantidad inválida"); return; }
  let producto=productos[index];
  if(cantidad>producto.stock){ alert("No hay suficiente stock"); return; }
  let subtotal=cantidad*producto.precio;
  carrito.push({index,nombre:producto.nombre,cantidad,subtotal,usuario:usuarioActivo});
  total+=subtotal;
  mostrarCarrito();
}
function mostrarCarrito(){
  let lista=document.getElementById("carritoLista");
  lista.innerHTML="";
  carrito.forEach(item=>{
    let li=document.createElement("li");
    li.textContent=`${item.nombre} x${item.cantidad} = $${item.subtotal}`;
    lista.appendChild(li);
  });
  document.getElementById("totalVenta").textContent=`Total: $${total}`;
}
function finalizarVenta(){
  if(carrito.length===0){ alert("Carrito vacío"); return; }
  carrito.forEach(item=>{ productos[item.index].stock-=item.cantidad; });
  caja.ventas+=total;
  localStorage.setItem("productos", JSON.stringify(productos));
  localStorage.setItem("caja", JSON.stringify(caja));
  historial.push({fecha:new Date().toLocaleDateString(), usuario:usuarioActivo, ventas:total});
  localStorage.setItem("historialCaja", JSON.stringify(historial));
  mostrarTicket();
  carrito=[]; total=0;
  mostrarCarrito();
  cargarProductosVenta();
}

/* ===== TICKET ===== */
function mostrarTicket(){
  document.getElementById("ventas").classList.add("hidden");
  document.getElementById("ticket").classList.remove("hidden");
  document.getElementById("ticketFecha").textContent="Fecha: "+new Date().toLocaleString();
  let lista=document.getElementById("ticketProductos");
  lista.innerHTML="";
  carrito.forEach(item=>{
    let li=document.createElement("li");
    li.textContent=`${item.nombre} x${item.cantidad} = $${item.subtotal}`;
    lista.appendChild(li);
  });
  document.getElementById("ticketTotal").textContent="TOTAL: $"+total;
}
function cerrarTicket(){
  document.getElementById("ticket").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
}
function descargarTicket(){
  const ticketDiv = document.getElementById("ticket");
  const ticketHtml = ticketDiv.cloneNode(true);
  ticketHtml.querySelectorAll('button').forEach(btn => btn.remove());
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Ticket</title>
<style>
body { background: #0f0f0f; color: white; font-family: Arial, sans-serif; padding: 20px; }
h3 { text-align: center; }
ul { list-style-type: none; padding-left: 0; }
</style>
</head>
<body>
${ticketHtml.innerHTML}
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Ticket_${new Date().toISOString().slice(0,10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ===== CAJA ===== */
function actualizarEstadoCaja(){
  const estado = document.getElementById("estadoCaja");
  if(!estado) return;
  if(caja.abierta){
    estado.innerHTML = `
      🟢 Caja ABIERTA<br>
      💵 Apertura: $${caja.apertura}<br>
      💰 Ventas: $${caja.ventas}
    `;
  } else {
    estado.innerHTML = `
      🔴 Caja CERRADA<br>
      💰 Último cierre: $${caja.cierre || 0}
    `;
  }
}
function abrirCajaVista(){ 
  document.getElementById("dashboard").classList.add("hidden"); 
  document.getElementById("caja").classList.remove("hidden"); 
  actualizarEstadoCaja(); 
}
function volverACaja(){ 
  document.getElementById("caja").classList.add("hidden"); 
  document.getElementById("dashboard").classList.remove("hidden"); 
}
function abrirCaja(){
  let m=Number(document.getElementById("montoApertura").value);
  if(!m){ alert("Ingresa monto de apertura"); return; }
  caja.abierta=true; caja.apertura=m; caja.cierre=0; caja.fecha = fechaISO();
  localStorage.setItem("caja",JSON.stringify(caja)); 
  actualizarEstadoCaja();
}
function cerrarCaja(){
  if(!caja.abierta){ alert("La caja no está abierta"); return; }
  const hoy = fechaISO();
  const yaCerrado = historialCierres.find(c => c.fecha === hoy);
  if (yaCerrado) { alert("⚠️ La caja de hoy ya fue cerrada"); return; }

  caja.abierta = false; 
  caja.cierre = caja.apertura + caja.ventas;
  localStorage.setItem("caja", JSON.stringify(caja));
  actualizarEstadoCaja();

  const datosCierre = {
    fecha: caja.fecha,
    hora: new Date().toLocaleTimeString(),
    usuario: usuarioActivo,
    ventas: caja.ventas,
    cierre: caja.cierre
  };
  historialCierres.push(datosCierre);
  localStorage.setItem("historialCierres", JSON.stringify(historialCierres));

  alert(`Cierre de caja:\nFecha: ${caja.fecha}\nUsuario: ${usuarioActivo}\nVentas: $${caja.ventas}\nCierre: $${caja.cierre}`);
}

/* ===== REPORTES ===== */
function mostrarReporteDiario() {
  const hoy = fechaISO();
  const ventasHoy = historial.filter(h => h.fecha === hoy);

  if (ventasHoy.length === 0) {
    document.getElementById("reporteActual").textContent = "No hay ventas registradas hoy";
    document.getElementById("resumenDiario").textContent = "";
    return;
  }

  let totalVentas = ventasHoy.reduce((sum, v) => sum + v.ventas, 0);
  document.getElementById("reporteActual").textContent = `Ventas totales hoy: $${totalVentas}`;

  let detalle = "Detalle de ventas:\n";
  ventasHoy.forEach(v => {
    detalle += `Usuario: ${v.usuario} - Ventas: $${v.ventas}\n`;
  });
  document.getElementById("resumenDiario").textContent = detalle;

  const historialUl = document.getElementById("historialReportes");
  historialUl.innerHTML = "";
  historialCierres.forEach(c => {
    let li = document.createElement("li");
    li.textContent = `Fecha: ${c.fecha} - Usuario: ${c.usuario} - Ventas: $${c.ventas} - Cierre: $${c.cierre}`;
    historialUl.appendChild(li);
  });
}

function abrirReportes() {
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("reportes").classList.remove("hidden");
  mostrarReporteDiario();
}

function volverReportes() {
  document.getElementById("reportes").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
}

function descargarInformeDiario() {
  const hoy = fechaISO();
  const ventasHoy = historial.filter(h => h.fecha === hoy);

  if (ventasHoy.length === 0) {
    alert("No hay ventas registradas hoy");
    return;
  }

  let contenido = `Reporte diario - ${hoy}\n\n`;
  let totalVentas = 0;
  ventasHoy.forEach(v => {
    contenido += `Usuario: ${v.usuario} - Ventas: $${v.ventas}\n`;
    totalVentas += v.ventas;
  });
  contenido += `\nTotal ventas del día: $${totalVentas}\n\n`;

  contenido += "Historial de cierres:\n";
  historialCierres.forEach(c => {
    contenido += `Fecha: ${c.fecha} - Usuario: ${c.usuario} - Ventas: $${c.ventas} - Cierre: $${c.cierre}\n`;
  });

  const blob = new Blob([contenido], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `InformeDiario_${hoy}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function verResumenPorDia() {
  const fecha = document.getElementById("fechaResumen").value;
  if (!fecha) { alert("Selecciona una fecha"); return; }

  const ventasDia = historial.filter(h => h.fecha === fecha);
  if (ventasDia.length === 0) {
    document.getElementById("resultadoResumenDia").textContent = "No hay ventas registradas";
    return;
  }

  let resumen = `Resumen de ventas - ${fecha}\n\n`;
  let total = 0;
  ventasDia.forEach(v => {
    resumen += `Usuario: ${v.usuario} - Ventas: $${v.ventas}\n`;
    total += v.ventas;
  });
  resumen += `\nTotal ventas: $${total}`;

  document.getElementById("resultadoResumenDia").textContent = resumen;
}

/* ===== CIERRE DE SESIÓN ===== */
function cerrarSesion(){
  usuarioActivo = null;
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("inventario").classList.add("hidden");
  document.getElementById("ventas").classList.add("hidden");
  document.getElementById("caja").classList.add("hidden");
  document.getElementById("reportes").classList.add("hidden");
  document.getElementById("ticket").classList.add("hidden");
  document.getElementById("login").classList.remove("hidden");
}

/* ===== UTILS ===== */
function fechaISO() { return new Date().toISOString().slice(0,10); }

/* ===== SERVICE WORKER ===== */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(reg => {
      reg.onupdatefound = () => {
        const newWorker = reg.installing;
        newWorker.onstatechange = () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            alert('🔄 Nueva versión disponible. Recarga la página para actualizar.');
          }
        };
      };
      console.log("Service Worker registrado correctamente");
    })
    .catch(err => console.log('Error SW:', err));

