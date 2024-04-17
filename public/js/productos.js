window.addEventListener('DOMContentLoaded', () => {
    const productosTable = document.getElementById('productos-table');

    // Función para mostrar los productos en la tabla
    const mostrarProductos = () => {
        fetch('http://localhost:3000/productos', {
            method: 'GET',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.response === 'success') {
                    const productos = data.data;

                    // Limpiar la tabla antes de agregar productos
                    productosTable.innerHTML = '';

                    // Agregar encabezados
                    productosTable.innerHTML = `
                        <tr>
                            <th>Nombre</th>
                            <th>Cantidad</th>
                            <th>Empresa</th>
                            <th>Acciones</th>
                        </tr>
                    `;

                    if (productos.length > 0) {
                        productos.forEach(producto => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${producto.nombre}</td>
                                <td>${producto.cantidad}</td>
                                <td>${producto.empresa}</td>
                                <td>
                                    <button class="btn-actualizar" data-id="${producto._id}">Actualizar</button>
                                    <button class="btn-eliminar" data-id="${producto._id}">Eliminar</button>
                                </td>
                            `;
                            productosTable.appendChild(row);
                        });

                        // Adjuntar manejadores de eventos a los botones después de agregarlos a la tabla
                        document.querySelectorAll('.btn-actualizar').forEach(btn => {
                            btn.addEventListener('click', () => {
                                const productoId = btn.getAttribute('data-id');
                                actualizarCantidad(productoId);
                            });
                        });

                        document.querySelectorAll('.btn-eliminar').forEach(btn => {
                            btn.addEventListener('click', () => {
                                const productoId = btn.getAttribute('data-id');
                                eliminarProducto(productoId);
                            });
                        });
                    } else {
                        // Si no hay productos, mostrar un mensaje en una fila
                        productosTable.innerHTML += '<tr><td colspan="4">No hay productos disponibles.</td></tr>';
                    }
                } else {
                    console.error('Error:', data.message);
                    productosTable.innerHTML = `<tr><td colspan="4">${data.message}</td></tr>`;
                }
            })
            .catch(err => console.error('Error:', err));
    };

    mostrarProductos(); // Llamar a la función para mostrar los productos al cargar la página

    // Verificar el rol del usuario y mostrar el formulario de agregar productos si es un proveedor
    fetch('http://localhost:3000/usuario/rol', {
        method: 'GET',
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            if (data.response === 'success' && data.rol === 'proveedor') {
                document.getElementById('formulario-agregar').style.display = 'block';
            }
        })
        .catch(err => console.error('Error:', err));

    // Agregar producto
    fetch('http://localhost:3000/usuario/rol', {
        method: 'GET',
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            if (data.response === 'success' && data.rol === 'proveedor') {
                document.getElementById('formulario-agregar').style.display = 'block';
            }
        })
        .catch(err => console.error('Error:', err));
    
    // Agregar producto
    const agregarProductoForm = document.getElementById('agregar-producto-form');
    agregarProductoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const cantidad = document.getElementById('cantidad').value;
    
        fetch('http://localhost:3000/productos/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, cantidad })
        })
            .then(res => res.json())
            .then(data => {
                if (data.response === 'success') {
                    alert('Producto agregado correctamente');
                    mostrarProductos(); // Actualizar la tabla después de agregar un producto
                } else {
                    alert('Error: ' + data.message); // Mostrar mensaje de error específico
                }
            })
            .catch(err => console.error('Error:', err));
    });

    // Función para actualizar la cantidad de un producto
    const actualizarCantidad = (productoId) => {
        const nuevaCantidad = prompt('Ingrese la nueva cantidad:');
        if (nuevaCantidad !== null) {
            fetch(`http://localhost:3000/productos/${productoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cantidad: nuevaCantidad })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.response === 'success') {
                        alert('Cantidad actualizada correctamente');
                        mostrarProductos(); // Actualizar la tabla después de actualizar la cantidad
                    } else {
                        alert('Error: ' + data.message); // Mostrar mensaje de error específico
                    }
                })
                .catch(err => console.error('Error:', err));
        }
    };

    // Función para eliminar un producto
    const eliminarProducto = (productoId) => {
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            fetch(`http://localhost:3000/productos/${productoId}`, {
                method: 'DELETE'
            })
                .then(res => res.json())
                .then(data => {
                    if (data.response === 'success') {
                        alert('Producto eliminado correctamente');
                        mostrarProductos(); // Actualizar la tabla después de eliminar un producto
                    } else {
                        alert('Error: ' + data.message); // Mostrar mensaje de error específico
                    }
                })
                .catch(err => console.error('Error:', err));
        }
    };

    // Botón para cerrar sesión
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    btnCerrarSesion.addEventListener('click', () => {
        fetch('/usuarios/logout', { 
            method: 'POST',
            credentials: 'include'
        })
            .then(res => {
                if (res.redirected) {
                    window.location.href = res.url; // Redirigir al usuario a la página de inicio
                } else {
                    alert('Error al cerrar sesión');
                }
            })
            .catch(err => console.error('Error:', err));
    });

});
