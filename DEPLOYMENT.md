# cPanel Deployment Guide

This project is arranged for cPanel as a Django backend plus a React/Vite frontend.

## Folder Structure

Upload the project like this:

```text
/home/yourusername/hotel-booking/
├── backend/
│   ├── passenger_wsgi.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── Travel/
│   ├── bookings/
│   ├── cms/
│   ├── payments/
│   ├── rooms/
│   ├── services/
│   ├── users/
│   └── vacancies/
├── frontend/
│   ├── dist/
│   ├── package.json
│   └── src/
├── .env
└── DEPLOYMENT.md
```

Use `backend` as the cPanel Python application root.

## 1. Build Frontend Locally

Run this on your computer before uploading:

```bash
cd frontend
npm install
npm run build
```

This creates:

```text
frontend/dist/
```

Upload the whole project, including `frontend/dist`.

Do not upload local-only items such as `venv/`, `frontend/node_modules/`, `local.sqlite3`, or your local `.env`. They are listed in `.cpanelignore` as a reminder.

## 2. Create MySQL Database In cPanel

In cPanel, open **MySQL Databases** and create:

- Database, for example `youruser_hotel`
- Database user, for example `youruser_hoteluser`
- Password
- Add the user to the database with **ALL PRIVILEGES**

## 3. Create The Python App

In cPanel, open **Setup Python App**.

Use these values:

```text
Application root: hotel-booking/backend
Application URL: /
Application startup file: passenger_wsgi.py
Application Entry point: application
Python version: 3.10+ if available
```

For this project, point the backend Python app to:

```text
api.regalrivulet.com
```

Point the React frontend/domain to:

```text
regalrivulet.com
```

## 4. Configure Environment

Create `.env` in the project root:

```text
/home/yourusername/hotel-booking/.env
```

You can also put it inside `backend/.env`; both locations are supported.

Example production config:

```env
SECRET_KEY=replace-with-a-strong-secret-key
DEBUG=False
ALLOWED_HOSTS=api.regalrivulet.com,regalrivulet.com,www.regalrivulet.com

DB_ENGINE=django.db.backends.mysql
DB_NAME=youruser_hotel
DB_USER=youruser_hoteluser
DB_PASSWORD=your-database-password
DB_HOST=localhost
DB_PORT=3306

CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=http://regalrivulet.com,http://www.regalrivulet.com,https://regalrivulet.com,https://www.regalrivulet.com
CSRF_TRUSTED_ORIGINS=http://regalrivulet.com,http://www.regalrivulet.com,http://api.regalrivulet.com,https://regalrivulet.com,https://www.regalrivulet.com,https://api.regalrivulet.com
FRONTEND_URL=http://regalrivulet.com

Frontend production build must use:

```env
VITE_API_URL=http://api.regalrivulet.com/api/
```

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@yourdomain.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=Regal Rivulet Retreat Hotel <noreply@yourdomain.com>
```

Generate a Django secret key:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## 5. Install Backend Requirements

In cPanel's Python App page, copy the virtualenv activation command, then run:

```bash
cd ~/hotel-booking/backend
pip install -r requirements.txt
```

If `mysqlclient` fails on shared hosting, install PyMySQL:

```bash
pip install pymysql
```

Then edit `backend/Travel/__init__.py` and add:

```python
import pymysql
pymysql.install_as_MySQLdb()
```

## 6. Run Django Setup

Run these commands from the backend folder:

```bash
cd ~/hotel-booking/backend
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

Then restart the Python app in cPanel.

## 7. Updating The Site Later

For frontend changes:

```bash
cd frontend
npm run build
```

Upload the updated `frontend/dist`, then run:

```bash
cd ~/hotel-booking/backend
python manage.py collectstatic --noinput
```

For backend changes, upload the changed backend files, then restart the Python app. If models changed, run:

```bash
python manage.py migrate
```

## Useful Local Commands

Backend:

```powershell
cd C:\Users\user\Downloads\Travel\Travel
$env:DATABASE_URL='sqlite:///local.sqlite3'
venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8000
```

Frontend:

```powershell
cd C:\Users\user\Downloads\Travel\Travel\frontend
npm run dev -- --host 127.0.0.1
```
