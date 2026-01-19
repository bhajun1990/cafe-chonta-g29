# Proyecto Café Chonta G29

Proyecto académico desarrollado para el curso de Desarrollo Web.

Café Chonta es una aplicación web de comercio electrónico que permite la venta de café orgánico, integrando un backend con Django Rest Framework y un frontend con React + Vite.

---

## 🚀 Tecnologías utilizadas

### Backend
- Python
- Django
- Django REST Framework
- Autenticación con JWT (SimpleJWT)

### Frontend
- React
- Vite
- Consumo de API REST
- Manejo automático de token JWT

---

## 🔐 Backend

### Funcionalidades
- Registro de usuarios
- Login con JWT
- Endpoints protegidos con JWT
- Gestión de productos
- Creación de pedidos
- Historial de pedidos por usuario
- Envío de correo de confirmación (entorno de desarrollo)

### Endpoints principales
- `/api/token/` → Login (JWT)
- `/api/products/` → Listado de productos
- `/api/orders/checkout/` → Crear pedido
- `/api/orders/my/` → Historial de pedidos (protegido)

### Ejecución del backend
```bash
cd backend
python manage.py runserver
