# Regal Rivulet cPanel Deployment

This project uses:

- Frontend: React/Vite on `regalrivulet.com`
- Backend: Django API on `api.regalrivulet.com`
- Database: cPanel MySQL database `webmitra_travel_backenddb`

All data added from the React admin panel is saved in the cPanel MySQL database and fetched from the same database by the public user pages.

## Backend Environment

Create this file on the server:

```text
backend/.env
```

Use this config:

```env
SECRET_KEY=replace-with-a-strong-django-secret-key
DEBUG=False
ALLOWED_HOSTS=api.regalrivulet.com,regalrivulet.com,www.regalrivulet.com

DB_ENGINE=django.db.backends.mysql
DB_NAME=webmitra_travel_backenddb
DB_USER=webmitra_regalrivulet
DB_PASSWORD=put-your-cpanel-database-user-password-here
DB_HOST=localhost
DB_PORT=3306

CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=http://regalrivulet.com,http://www.regalrivulet.com,https://regalrivulet.com,https://www.regalrivulet.com
CSRF_TRUSTED_ORIGINS=http://regalrivulet.com,http://www.regalrivulet.com,http://api.regalrivulet.com,https://regalrivulet.com,https://www.regalrivulet.com,https://api.regalrivulet.com
FRONTEND_URL=https://regalrivulet.com
```

The database password must be the password for the cPanel user `webmitra_regalrivulet`.

## Backend Setup

In cPanel Python App:

```text
Application root: backend
Application URL: api.regalrivulet.com
Startup file: passenger_wsgi.py
Entry point: application
```

Then run:

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
```

Restart the Python app from cPanel.

Backend checks:

```text
https://api.regalrivulet.com/
https://api.regalrivulet.com/api/health/
```

Django admin:

```text
https://api.regalrivulet.com/django-admin/
```

## Frontend Setup

Build:

```bash
cd frontend
npm install
npm run build
```

Upload everything inside:

```text
frontend/dist/
```

to the `regalrivulet.com` public folder.

Make sure this hidden file is uploaded too:

```text
frontend/dist/.htaccess
```

React admin panel:

```text
https://regalrivulet.com/admin
```

## Admin Login

```text
Email: admin@regalrivulet.com
Password: Regalrivulet@123
```

or:

```text
Email: info@regalrivulet.com
Password: Regalrivulet@123
```

## Important

Do not upload `local.sqlite3` to cPanel. Production data must use:

```text
webmitra_travel_backenddb
```

If images do not show after deployment, upload them from the React admin panel again so the real files exist in server media storage.
