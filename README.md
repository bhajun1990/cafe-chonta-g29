# Proyecto Café Chonta G29

Proyecto académico desarrollado para el curso de Desarrollo Web.

## Backend
- Django + Django REST Framework
- Autenticación con JWT
- Endpoints:
  - /api/token/
  - /api/products/
  - /api/orders/

Para ejecutar:
bash
cd backend
python manage.py runserver

## Frontend
-React + Vite
-Consumo de API REST
-Envío manual de token JWT para realizar compras

Para ejecutar:
cd frontend
npm install
npm run dev

## Flujo principal

1. Obtener token desde el backend
2. Listar productos
3. Agregar productos al carrito
4. Registrar orden de compra
