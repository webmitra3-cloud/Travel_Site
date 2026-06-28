"""
WSGI config for Travel project.
Entry point for cPanel Passenger and production WSGI servers.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)

# Also check for root-level .env
root_env_path = Path(__file__).resolve().parent.parent.parent / '.env'
if root_env_path.exists():
    load_dotenv(root_env_path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Travel.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
