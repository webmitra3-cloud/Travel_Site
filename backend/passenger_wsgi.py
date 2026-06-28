import os
import sys

# Add the Django project directory to the Python path
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_dir)

# Load environment variables
from dotenv import load_dotenv
env_path = os.path.join(project_dir, '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)

# Also load from parent directory .env
parent_env_path = os.path.join(os.path.dirname(project_dir), '.env')
if os.path.exists(parent_env_path):
    load_dotenv(parent_env_path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Travel.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
