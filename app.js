const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

// Configuración de express-session
app.use(session({
    secret: 'tu-secreto', // Secreto para firmar las cookies de sesión
    resave: false,
    saveUninitialized: false
}));

mongoose.connect('mongodb+srv://daniel:1234@test.akb5cl4.mongodb.net/test');

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('Conexión a la base de datos exitosa...');
});

connection.on('error', (err) => {
    console.log('Error en conexión a la base de datos: ', err);
});

// Modelos
const Usuario = mongoose.model('Usuario', { 
    username: String, 
    password: String, 
    rol: String, 
    companyName: { type: String, default: null } // Nuevo campo para el nombre de la empresa
});
const Producto = mongoose.model('Producto', { 
    nombre: String, 
    cantidad: Number, 
    empresa: String // Campo para almacenar la empresa del usuario que agrega el producto
});

// Rutas para usuarios
// Agregar usuario
app.post('/usuarios/registrar', (req, res) => {
    const { username, password, rol, companyName } = req.body;
    const usuario = new Usuario({ username, password, rol, companyName });

    usuario.save()
        .then(doc => {
            console.log('Usuario registrado correctamente:', doc);
            res.json({ response: 'success', data: doc });
        })
        .catch(err => {
            console.log('Error al registrar usuario:', err.message);
            res.status(400).json({ response: 'failed' });
        });
});

// Ruta de inicio de sesión
app.post('/usuarios/login', (req, res) => {
    const { username, password } = req.body;

    Usuario.findOne({ username, password })
        .then(user => {
            if (user) {
                // Almacenar la información del usuario en la sesión
                req.session.user = user;
                res.json({ response: 'success', redirectTo: '/productos' });
            } else {
                res.status(401).json({ response: 'failed', message: 'Credenciales incorrectas' });
            }
        })
        .catch(err => {
            console.log('Error al iniciar sesión:', err.message);
            res.status(500).json({ response: 'failed', message: 'Error interno del servidor' });
        });
});

// Ruta para cerrar sesión
app.post('/usuarios/logout', (req, res) => {
    // Limpiar las cookies del cliente
    res.clearCookie('connect.sid');
    
    // Destruir la sesión del usuario
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            res.status(500).json({ response: 'failed', message: 'Error interno del servidor' });
        } else {
            console.log('Sesión cerrada correctamente');
            res.redirect('/'); // Redirigir al usuario a la página de inicio
        }
    });
});

// Rutas protegidas que requieren autenticación
const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ response: 'failed', message: 'Usuario no autenticado' });
    }
};

// Ruta para obtener el rol del usuario
app.get('/usuario/rol', requireAuth, (req, res) => {
    const usuario = req.session.user;
    if (usuario) {
        res.json({ response: 'success', rol: usuario.rol });
    } else {
        res.status(401).json({ response: 'failed', message: 'Usuario no autenticado' });
    }
});

// Rutas para productos
// Obtener todos los productos
app.get('/productos', requireAuth, (req, res) => {
    const usuario = req.session.user;

    if (usuario.rol === 'cliente') {
        // Si el usuario es cliente, mostrar todos los productos
        Producto.find({}, 'nombre cantidad empresa') 
            .then(docs => {
                res.json({ response: 'success', data: docs });
            })
            .catch(err => {
                console.log('Error al consultar productos:', err.message);
                res.status(400).json({ response: 'failed' });
            });
    } else if (usuario.rol === 'proveedor' && usuario.companyName) {
        // Si el usuario es proveedor y tiene una empresa registrada, mostrar solo los productos de esa empresa
        Producto.find({ empresa: usuario.companyName }, 'nombre cantidad empresa') 
            .then(docs => {
                res.json({ response: 'success', data: docs });
            })
            .catch(err => {
                console.log('Error al consultar productos:', err.message);
                res.status(400).json({ response: 'failed' });
            });
    } else {
        // Si el usuario es proveedor pero no tiene una empresa registrada, devolver un error
        res.status(403).json({ response: 'failed', message: 'No tienes una empresa registrada.' });
    }
});

// Ruta para agregar producto (solo para proveedores)
app.post('/productos/agregar', requireAuth, (req, res) => {
    const { nombre, cantidad } = req.body;
    const usuario = req.session.user;

    // Verificar si el usuario es un proveedor y tiene una empresa registrada
    if (usuario.rol === 'proveedor' && usuario.companyName) {
        const producto = new Producto({ nombre, cantidad, empresa: usuario.companyName });

        producto.save()
            .then(doc => {
                console.log('Producto agregado correctamente:', doc);
                res.json({ response: 'success', data: doc });
            })
            .catch(err => {
                console.log('Error al agregar producto:', err.message);
                res.status(400).json({ response: 'failed' });
            });
    } else {
        res.status(403).json({ response: 'failed', message: 'No tienes permisos para agregar productos o no has registrado una empresa.' });
    }
});

// Ruta para actualizar la cantidad de producto
app.put('/productos/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const { cantidad } = req.body;

    Producto.findByIdAndUpdate(id, { cantidad }, { new: true })
        .then(doc => {
            if (doc) {
                console.log('Cantidad de producto actualizada correctamente:', doc);
                res.json({ response: 'success', data: doc });
            } else {
                console.log('Producto no encontrado');
                res.status(404).json({ response: 'failed', message: 'Producto no encontrado' });
            }
        })
        .catch(err => {
            console.log('Error al actualizar la cantidad de producto:', err.message);
            res.status(400).json({ response: 'failed', message: 'Error al actualizar la cantidad de producto' });
        });
});

// Ruta para eliminar un producto
app.delete('/productos/:id', requireAuth, (req, res) => {
    const { id } = req.params;

    Producto.findByIdAndDelete(id)
        .then(doc => {
            if (doc) {
                console.log('Producto eliminado correctamente:', doc);
                res.json({ response: 'success', message: 'Producto eliminado correctamente' });
            } else {
                console.log('Producto no encontrado');
                res.status(404).json({ response: 'failed', message: 'Producto no encontrado' });
            }
        })
        .catch(err => {
            console.log('Error al eliminar el producto:', err.message);
            res.status(400).json({ response: 'failed', message: 'Error al eliminar el producto' });
        });
});


app.listen(3000, () => {
    console.log('Servidor listo...');
});
