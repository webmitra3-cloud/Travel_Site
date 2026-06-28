# Regal Rivulet Retreat Hotel - Booking Platform

Full-stack hotel booking platform:

- `backend/` - Django REST Framework app for cPanel Python App
- `frontend/` - React + TypeScript + Vite app

For cPanel deployment, use `backend` as the Python application root and upload the built frontend from `frontend/dist`.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full deployment steps.

## Local Run

Backend:

```powershell
$env:DATABASE_URL='sqlite:///local.sqlite3'
venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8000
```

Frontend:

```powershell
cd frontend
npm run dev -- --host 127.0.0.1
```
