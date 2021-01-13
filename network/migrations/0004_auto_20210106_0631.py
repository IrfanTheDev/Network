# Generated by Django 3.1.4 on 2021-01-06 01:01

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0003_auto_20210105_0731'),
    ]

    operations = [
        migrations.RenameField(
            model_name='post',
            old_name='dislike',
            new_name='dislikes',
        ),
        migrations.RenameField(
            model_name='post',
            old_name='like',
            new_name='likes',
        ),
        migrations.CreateModel(
            name='Likeness',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('like', models.BooleanField()),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='network.post')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='liker', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]