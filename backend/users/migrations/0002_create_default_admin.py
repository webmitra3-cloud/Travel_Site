from django.db import migrations
from django.contrib.auth.hashers import make_password


ADMIN_EMAIL = 'info@regalrivulet.com'
ADMIN_PASSWORD = 'Regalrivulet@123'


def create_default_admin(apps, schema_editor):
    User = apps.get_model('users', 'User')
    user, _ = User.objects.get_or_create(
        email=ADMIN_EMAIL,
        defaults={
            'full_name': 'Regal Rivulet Admin',
            'role': 'ADMIN',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        },
    )
    user.full_name = user.full_name or 'Regal Rivulet Admin'
    user.role = 'ADMIN'
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.password = make_password(ADMIN_PASSWORD)
    user.save()


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_admin, noop_reverse),
    ]
