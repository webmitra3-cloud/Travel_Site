from django.contrib.auth.hashers import make_password
from django.db import migrations


ADMIN_PASSWORD = 'Regalrivulet@123'
ADMIN_ACCOUNTS = [
    ('info@regalrivulet.com', 'Regal Rivulet Admin'),
    ('admin@regalrivulet.com', 'Regal Rivulet Admin'),
]


def ensure_admin_accounts(apps, schema_editor):
    User = apps.get_model('users', 'User')
    for email, full_name in ADMIN_ACCOUNTS:
        user, _ = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': full_name,
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            },
        )
        user.full_name = user.full_name or full_name
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
        ('users', '0002_create_default_admin'),
    ]

    operations = [
        migrations.RunPython(ensure_admin_accounts, noop_reverse),
    ]
