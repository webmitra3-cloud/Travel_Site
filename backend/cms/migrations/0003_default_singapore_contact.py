from django.db import migrations


def set_default_contact_info(apps, schema_editor):
    ContactInformation = apps.get_model('cms', 'ContactInformation')
    contact = ContactInformation.objects.order_by('id').first()
    if contact is None:
        contact = ContactInformation()

    contact.address = 'Singapore'
    contact.phone = '+447441392410'
    contact.email = 'info@regalrivulet.com'
    contact.map_url = 'https://www.google.com/maps?q=Singapore&output=embed'
    contact.save()


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('cms', '0002_aboutpagecontent_executiveteammember_facility_and_more'),
    ]

    operations = [
        migrations.RunPython(set_default_contact_info, noop_reverse),
    ]
