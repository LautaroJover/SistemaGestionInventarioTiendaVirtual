# Sistema de Gestión de Inventario y Ventas para una Tienda Electrónica

> **Materia:** Base de Datos II
> **Enfoque:** Didáctico, simple y directo. Pensado para un programador Trainee/Junior.
> **Stack:** MongoDB + Node.js + Express + Mongoose + React + Axios.

---

## 1. Descripción del Proyecto

Este proyecto es un **Sistema de Gestión de Inventario y Ventas** para una tienda electrónica. Permite administrar productos, clientes, pedidos y generar informes de ventas.

El sistema se divide en tres partes muy claras:

1. **Base de Datos (MongoDB local):** Almacena Productos, Clientes y Pedidos.
2. **Backend (Node.js + Express + Mongoose):** Expone una API REST que el frontend consume.
3. **Frontend (React):** Pantallas simples para probar la API (crear productos, clientes, registrar pedidos y ver informes).

### ¿Por qué MongoDB?

Porque es una base de datos **NoSQL orientada a documentos**. En lugar de tablas y filas, guarda documentos en formato **JSON/BSON**, lo que nos permite representar de forma natural que un **Pedido tenga muchos productos embebidos** dentro del mismo documento.

### Tecnologías

| Capa | Tecnología | Para qué se usa |
|------|------------|-----------------|
| Base de datos | MongoDB (local) | Persistir documentos JSON |
| Backend | Node.js + Express | Crear la API REST |
| ORM/ODM | Mongoose | Definir esquemas y conectar con MongoDB |
| Frontend | React (con Vite) | Interfaz de usuario |
| Cliente HTTP | Axios | Consumir la API desde React |
| Extensión VS Code | MongoDB for VS Code | Visualizar y consultar la BD en vivo |

---

## 2. Diseño Conceptual y Lógico

Usamos **3 colecciones** (equivalente a "tablas" en SQL):

### 2.1. `productos`

Representa cada artículo que se vende en la tienda.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | ObjectId | Identificador único (lo genera MongoDB) |
| `nombre` | String | Nombre del producto (ej: "Mouse Gamer") |
| `descripcion` | String | Detalle del producto |
| `precio` | Number | Precio unitario |
| `stock` | Number | Cantidad disponible en inventario |
| `categoria` | String | Categoría fija: `Componentes PC`, `Periféricos`, `Monitores`, `Notebooks` o `Accesorios` |
| `imagen` | String | URL pública de la imagen del producto |
| `categoria` | String | Categoría (ej: "Periféricos", "Audio") |

**Ejemplo de documento:**
```json
{
  "_id": "665f1a...",
  "nombre": "Mouse Gamer",
  "descripcion": "Mouse óptico RGB",
  "precio": 15000,
  "stock": 25,
  "categoria": "Periféricos",
  "imagen": "https://placehold.co/400x300/2563eb/ffffff?text=Mouse"
}
```

### 2.2. `clientes`

Personas que compran en la tienda.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | ObjectId | Identificador único |
| `nombre` | String | Nombre completo |
| `email` | String | Correo electrónico (único) |
| `telefono` | String | Teléfono de contacto |
| `direccion` | String | Dirección de envío |

**Ejemplo:**
```json
{
  "_id": "665f1b...",
  "nombre": "Lautaro Jover",
  "email": "lautaro@example.com",
  "telefono": "+54 11 5555-5555",
  "direccion": "Av. Siempre Viva 742"
}
```

### 2.3. `pedidos`

Registra cada venta. **Acá está la decisión clave del modelo:** embebemos los productos comprados **dentro** del pedido. Esto evita hacer JOINs y refleja la realidad: un pedido es "un conjunto de productos comprados en una fecha por un cliente".

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | ObjectId | Identificador único del pedido |
| `cliente` | ObjectId (ref) | Referencia al cliente que compró |
| `productos` | Array | Lista de productos comprados |
| `productos[].producto` | ObjectId (ref) | Referencia al producto |
| `productos[].cantidad` | Number | Cuántas unidades |
| `productos[].precioUnitario` | Number | Precio al momento de la compra |
| `fecha` | Date | Fecha del pedido |
| `estado` | String | `pendiente`, `enviado` o `entregado` |
| `total` | Number | Suma total del pedido |

**Ejemplo:**
```json
{
  "_id": "665f1c...",
  "cliente": "665f1b...",
  "productos": [
    { "producto": "665f1a...", "cantidad": 2, "precioUnitario": 15000 }
  ],
  "fecha": "2026-06-30T18:00:00.000Z",
  "estado": "pendiente",
  "total": 30000
}
```

### ¿Por qué embebimos los productos en el pedido?

Porque el dominio es claro: **un pedido contiene productos**. Embebirlos simplifica:
- La consulta (un solo `find` te trae el pedido completo).
- La agregación para informes (`$unwind` sobre `pedidos.productos` es directo).

---

## 3. Implementación de la API REST

El backend expone los siguientes endpoints:

### Productos (`/api/productos`)

| Método | Ruta | Acción |
|--------|------|--------|
| GET    | `/api/productos`        | Lista todos los productos |
| GET    | `/api/productos/:id`    | Obtiene un producto por ID |
| POST   | `/api/productos`        | Crea un producto |
| PUT    | `/api/productos/:id`    | Actualiza un producto |
| DELETE | `/api/productos/:id`    | Elimina un producto |

### Clientes (`/api/clientes`)

| Método | Ruta | Acción |
|--------|------|--------|
| GET    | `/api/clientes`         | Lista todos los clientes |
| GET    | `/api/clientes/:id`     | Obtiene un cliente por ID |
| POST   | `/api/clientes`         | Crea un cliente |
| DELETE | `/api/clientes/:id`     | Elimina un cliente |

### Pedidos (`/api/pedidos`)

| Método | Ruta | Acción |
|--------|------|--------|
| GET    | `/api/pedidos`               | Lista todos los pedidos con datos del cliente y de los productos (`.populate()`) |
| POST   | `/api/pedidos`               | **Crea un pedido y descuenta stock automáticamente** |
| PUT    | `/api/pedidos/:id/estado`    | Cambia el estado del pedido (`pendiente` / `enviado` / `entregado`) |
| DELETE | `/api/pedidos/:id`           | Elimina un pedido |

### Informes (`/api/informes`)

| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/api/informes/ventas-por-producto`  | Total vendido por producto |
| GET | `/api/informes/ventas-por-categoria` | Total vendido por categoría |
| GET | `/api/informes/ventas-por-mes`       | Total vendido por mes |

---

## 4. Consultas Relevantes (explicadas paso a paso)

### 4.1. Actualización de stock con `$inc` (requisito 4)

Cuando se confirma un pedido, descontamos del stock de cada producto la cantidad comprada. Usamos el operador `$inc` de MongoDB, que **incrementa** un campo numérico (si le pasamos un número negativo, lo decrementa).

**Lógica del endpoint `POST /api/pedidos`:**

```
1. Recibir el body: { clienteId, items: [{productoId, cantidad}] }
2. Por cada item:
   - Verificar que hay stock suficiente
   - Actualizar el producto: stock = stock - cantidad  (con $inc: { stock: -cantidad })
3. Crear el documento Pedido con los items y el total
4. Devolver el pedido creado
```

**Operador usado:**

```javascript
// Descontar 2 unidades del stock del producto con id X
Producto.updateOne(
  { _id: productoId },
  { $inc: { stock: -2 } }
);
```

`$inc` recibe un **número negativo** para restar. Es atómico: MongoDB se asegura de que dos ventas simultáneas no rompan el inventario.

### 4.2. Informes con Framework de Agregación (requisito 5)

El **Aggregation Framework** es la herramienta más poderosa de MongoDB. Permite encadenar etapas (`$match`, `$unwind`, `$group`, `$sort`) que transforman los documentos paso a paso.

#### Informe: Ventas por producto

```javascript
db.pedidos.aggregate([
  // 1. Desarmamos el array "productos" del pedido:
  //    Si el pedido tiene 3 productos, se generan 3 documentos (uno por item).
  { $unwind: "$productos" },

  // 2. Agrupamos por producto y sumamos cantidades * precioUnitario
  { $group: {
      _id: "$productos.producto",          // agrupamos por id de producto
      totalVendido: { $sum: { $multiply: ["$productos.cantidad", "$productos.precioUnitario"] } },
      unidadesVendidas: { $sum: "$productos.cantidad" }
  }},

  // 3. Traemos los datos del producto relacionado (como un JOIN)
  { $lookup: {
      from: "productos",
      localField: "_id",
      foreignField: "_id",
      as: "producto"
  }},
  { $unwind: "$producto" },

  // 4. Proyectamos solo lo que nos interesa mostrar
  { $project: {
      _id: 0,
      nombre: "$producto.nombre",
      categoria: "$producto.categoria",
      unidadesVendidas: 1,
      totalVendido: 1
  }},

  // 5. Ordenamos de mayor a menor venta
  { $sort: { totalVendido: -1 } }
]);
```

**Explicación línea por línea:**

1. **`$unwind`**: "Abre" el array `productos`. Si un pedido tiene 3 productos, se duplica el pedido 3 veces, una por producto. Es como "normalizar" temporalmente.
2. **`$group`**: Agrupa por `producto` y suma `cantidad * precioUnitario` (multiplicamos porque queremos el **importe total**, no solo la cantidad).
3. **`$lookup`**: Hace un "JOIN" con la colección `productos` para traer nombre y categoría.
4. **`$project`**: Limpia el resultado, dejando solo los campos que mostraremos.
5. **`$sort`**: Ordena por total vendido descendente.

#### Informe: Ventas por categoría

Es igual al anterior pero agrupa por `producto.categoria`.

#### Informe: Ventas por mes

Usa `$group` con `_id: { $dateToString: { format: "%Y-%m", date: "$fecha" } }` para agrupar por mes-año.

---

## 5. Guía de Presentación con MongoDB for VS Code

Esta es la **guía paso a paso** para la defensa en vivo frente a los profesores.

### Paso 1: Instalar la extensión

1. Abrí Visual Studio Code.
2. Andá a la pestaña de **Extensiones** (Ctrl+Shift+X).
3. Buscá **"MongoDB for VS Code"** (la oficial de MongoDB Inc.).
4. Click en **Install**.

### Paso 2: Verificar que MongoDB local está corriendo

Antes de conectar la extensión, asegurate de que el servicio de MongoDB local está activo.

- En **Windows**: Abrí "Services" (services.msc) y verificá que el servicio "MongoDB Server" esté en estado "Running". Si no, inicielo.
- En **Mac/Linux**: `sudo systemctl status mongod` o `brew services list`.

Para comprobarlo rápido, abrí una terminal y ejecutá:

```bash
mongosh
```

Si entrás a la consola, todo está OK. Salí con `exit`.

### Paso 3: Conectar la extensión a MongoDB local

1. En VS Code, hacé click en el **icono de MongoDB** que aparece en la barra lateral izquierda (parece una hoja con un rayo). Es la vista "MongoDB".
2. En el panel, click en **"Create New Connection"** o en el ícono "+" al lado de "Connections".
3. En el campo de conexión, pegá:

   ```
   mongodb://localhost:27017
   ```

4. Presioná Enter. La extensión intentará conectar.

### Paso 4: Seleccionar la base de datos

Una vez conectado:

1. En el panel de la izquierda, expandí la conexión `localhost:27017`.
2. Vas a ver todas las bases de datos. Buscá **`tienda_inventario`**.
   - Si todavía no existe, no te preocupes: se crea automáticamente la primera vez que el backend inserta un documento.
3. Expandí `tienda_inventario` y vas a ver las colecciones: **`clientes`**, **`pedidos`**, **`productos`**.

### Paso 5: Abrir un Playground

Un **Playground** es un archivo `.mongodb.js` donde podés escribir consultas JavaScript que se ejecutan contra tu base de datos, y los resultados aparecen al lado. Es **la forma más vistosa de demostrar** tu trabajo.

1. En el panel de MongoDB, click derecho sobre la conexión → **"Create New Playground"**.
2. VS Code te abre un archivo nuevo con un nombre tipo `playground-01.mongodb.js`.
3. **Reemplazá todo su contenido** por el de nuestro archivo [`presentacion.mongodb.js`](./presentacion.mongodb.js).
4. Guardá el archivo.

### Paso 6: Ejecutar consultas en vivo

Cada línea con `db.coleccion.metodo(...)` se puede ejecutar de **tres formas**:

- Click en el botón ▶️ que aparece a la izquierda de la línea.
- Click derecho sobre la línea → "Run Selected Line".
- Atajo: seleccioná la línea y presioná **Ctrl+Shift+P** → "Run Selected Lines From Playground".

> 💡 **Tip:** podés seleccionar varias líneas y ejecutarlas juntas.

### Paso 7: Demostración sugerida (orden para la defensa)

1. **Mostrar la estructura de las 3 colecciones** ejecutando `use(...)` y `find().limit(1)`.
2. **Insertar datos de prueba** con `insertMany(...)`.
3. **Crear un pedido** que descienda stock.
4. **Volver a leer el producto** y mostrar que su `stock` cambió (requisito 4).
5. **Ejecutar las 3 agregaciones** de informes (requisito 5).
6. **Mostrar el log de consultas** que la extensión captura abajo (esto demuestra profesionalismo).

### Paso 8: Ver el detalle de un documento

- En el panel de la izquierda, **expandí** una colección (por ejemplo `productos`).
- Doble click sobre cualquier documento y se abre un panel con su JSON completo formateado.
- Esto es lo más directo para mostrar a los profesores la forma de los documentos.

---

## 6. Instrucciones de Ejecución

### Requisitos previos

- **Node.js 18+** ([https://nodejs.org](https://nodejs.org))
- **MongoDB Community** instalado y corriendo en `localhost:27017`
- **Visual Studio Code** con la extensión **MongoDB for VS Code**

### 6.1. Levantar el Backend

```bash
cd backend
npm install
npm run dev
```

El servidor queda en `http://localhost:4000`.

### 6.2. Levantar el Frontend

```bash
cd frontend
npm install
npm run dev
```

La app queda en `http://localhost:5173` (Vite).

### 6.3. Datos de prueba (opcional)

Podés cargar datos de prueba con:

```bash
cd backend
npm run seed
```

Esto inserta 6 productos (con imágenes), 3 clientes y 4 pedidos de ejemplo en la BD `tienda_inventario`.

---

## 7. Estructura del Proyecto

```
SistemaGestionInventarioTiendaVirtual/
├── README.md                       (este archivo)
├── .gitignore
├── presentacion.mongodb.js         (Playground listo para VS Code)
├── backend/
│   ├── package.json
│   ├── .env                        (variables de entorno)
│   ├── .env.example                (plantilla de variables)
│   ├── server.js                   (punto de entrada)
│   ├── config/
│   │   └── db.js                   (conexión a MongoDB)
│   ├── models/
│   │   ├── Producto.js
│   │   ├── Cliente.js
│   │   └── Pedido.js
│   ├── controllers/
│   │   ├── productoController.js
│   │   ├── clienteController.js
│   │   ├── pedidoController.js    (¡el importante! con $inc y cambio de estado)
│   │   └── informeController.js   (¡el importante! con aggregate)
│   ├── routes/
│   │   ├── productoRoutes.js
│   │   ├── clienteRoutes.js
│   │   ├── pedidoRoutes.js
│   │   └── informeRoutes.js
│   └── seed.js                     (datos de prueba con imágenes)
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                 (incluye botón Dark Mode)
        ├── App.css                 (estilos + variables de Dark Mode)
        ├── api.js                  (instancia de Axios)
        └── components/
            ├── Productos.jsx       (con categorías fijas, imagen y labels)
            ├── Clientes.jsx
            ├── Pedidos.jsx         (con selector de estado)
            └── Informes.jsx
```

---

## 8. Mejoras de UX/UI

Esta sección resume las mejoras visuales y funcionales agregadas sobre la versión base.

### 8.1. Categorías predefinidas

En el formulario de Productos, el campo "Categoría" es un `<select>` con cinco opciones fijas que simulan una tienda de hardware/gaming:

- **Componentes PC**
- **Periféricos**
- **Monitores**
- **Notebooks**
- **Accesorios**

Esto evita errores de tipeo y mantiene consistencia para los informes por categoría.

### 8.2. Claridad en los inputs

Cada campo del formulario de Productos tiene su `<label>` y `placeholder` descriptivo, por ejemplo:

- `Precio (en pesos $)` — placeholder: *"Ej: 15000"*
- `Stock (unidades disponibles)` — placeholder: *"Ej: 25"*

De esta forma es imposible confundir en qué casilla va cada dato.

### 8.3. Imagen del producto

Cada producto puede tener una **URL de imagen** que se guarda en el campo `imagen` del modelo (como simple string). Las ventajas de esta implementación:

- **Didáctica**: no requiere storage, ni Cloudinary, ni uploads. Es un String plano.
- **Visible**: la imagen se renderiza directamente en la tarjeta de cada producto.
- **Robusta**: si la URL falla o está vacía, se muestra un placeholder automático (`onError`).
- **Datos de prueba**: el `seed.js` carga URLs de `placehold.co` para que la presentación luzca imágenes reales.

**Ejemplo de documento con imagen:**

```json
{
  "nombre": "Mouse Gamer RGB",
  "precio": 15000,
  "stock": 25,
  "categoria": "Periféricos",
  "imagen": "https://placehold.co/400x300/2563eb/ffffff?text=Mouse"
}
```

### 8.4. Modificar el estado del pedido

En cada tarjeta del **Historial de Pedidos** hay un `<select>` que permite cambiar el estado del pedido en vivo:

- `pendiente`
- `enviado`
- `entregado`

Al cambiarlo, el frontend hace `PUT /api/pedidos/:id/estado` y el backend actualiza el documento en MongoDB, devolviendo el pedido actualizado. El badge de estado se refresca automáticamente.

**Backend (controlador):**

```javascript
async function actualizarEstado(req, res) {
  const { estado } = req.body;
  const estadosValidos = ['pendiente', 'enviado', 'entregado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  const actualizado = await Pedido.findByIdAndUpdate(
    req.params.id,
    { estado },
    { new: true }
  );
  res.json(actualizado);
}
```

**Frontend:**

```jsx
const cambiarEstado = async (id, nuevoEstado) => {
  await api.put(`/pedidos/${id}/estado`, { estado: nuevoEstado });
  cargar();
};

<select value={p.estado} onChange={(e) => cambiarEstado(p._id, e.target.value)}>
  <option value="pendiente">pendiente</option>
  <option value="enviado">enviado</option>
  <option value="entregado">entregado</option>
</select>
```

### 8.5. Modo Oscuro (Dark Mode)

En la esquina superior derecha de la página hay un botón 🌙 / ☀️ que alterna entre **Modo Claro** y **Modo Oscuro**.

**Implementación técnica:**

1. **Variables CSS en `:root`** (tema claro por defecto): definen colores como `--bg-card`, `--color-texto`, `--color-primario`, etc.
2. **Override en `body.dark-theme`**: redefine esas mismas variables con los colores oscuros.
3. **React**: mantiene un estado `dark` (boolean). Al cambiar, hace `document.body.classList.toggle('dark-theme', dark)`.
4. **Persistencia**: la elección se guarda en `localStorage`, así el modo elegido sobrevive a recargas.

**Ejemplo simplificado del CSS:**

```css
:root {
  --bg-card:  #ffffff;
  --texto:    #1f2937;
  --primario: #2563eb;
}

body.dark-theme {
  --bg-card:  #1e293b;
  --texto:    #e2e8f0;
  --primario: #3b82f6;
}

.card {
  background: var(--bg-card);
  color: var(--texto);
}
```

**Ventaja didáctica:** como **toda** la app usa variables, basta con cambiar la clase del `<body>` para re-tematizar la página completa sin tocar un solo componente.

---

## 9. Notas Didácticas Finales

- **Mongoose** es un ODM (Object Document Mapper). Te permite definir **esquemas** (la forma del documento) y te da métodos como `find()`, `create()`, etc.
- **El `populate`** es como un JOIN de SQL. Trae el documento referenciado en vez de solo su ID.
- **El `$inc`** es atómico: si dos ventas ocurren al mismo tiempo sobre el mismo producto, MongoDB no las mezcla.
- **El Aggregation Framework** es un pipeline: la salida de una etapa es la entrada de la siguiente.
- **Las variables CSS** son la forma más simple de implementar temas: definís colores en `:root` y los reasignás en otra clase. Todos los componentes usan `var(--mi-color)`, así que con un solo cambio de clase en el `<body>` se re-tematiza la app entera.

Éxitos en la defensa. 🚀
