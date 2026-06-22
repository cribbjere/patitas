from django.contrib import admin
from .models import Servicio


@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):

    list_display = (
        'descripcion',
        'categoria',
        'precio',
        'estado'
    )

    list_filter = (
        'categoria',
        'estado'
    )

    search_fields = (
        'descripcion',
    )