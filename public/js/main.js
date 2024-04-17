window.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const rolSelect = document.getElementById('rol');
    const companyNameInput = document.getElementById('company-name');

    rolSelect.addEventListener('change', () => {
        if (rolSelect.value === 'proveedor') {
            companyNameInput.style.display = 'block';
        } else {
            companyNameInput.style.display = 'none';
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        fetch('http://localhost:3000/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.response === 'success') {
                alert('Inicio de sesión exitoso');
                window.location.href = '/productos.html'; // Redirige a la página de productos
            } else {
                alert('Error al iniciar sesión: ' + data.message);
            }
        })
        .catch(err => console.error('Error:', err));
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const rol = document.getElementById('rol').value;
        const companyName = document.getElementById('company-name').value; // Obtener el valor del campo nombre de la empresa

        fetch('http://localhost:3000/usuarios/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, rol, companyName }) // Incluir el nombre de la empresa en el cuerpo de la solicitud
        })
        .then(res => res.json())
        .then(data => {
            if (data.response === 'success') {
                alert('Usuario registrado correctamente');
            } else {
                alert('Error al registrar usuario');
            }
        })
        .catch(err => console.error('Error:', err));
    });
});
