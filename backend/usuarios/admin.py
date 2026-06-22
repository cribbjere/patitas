from django.contrib import admin
from .models import PerfilUsuario


@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):

    list_display = (
        'usuario',
        'rol',
        'estado',
        'fecha_creacion'
    )

    list_filter = (
        'rol',
        'estado'
    )

    search_fields = (
        'usuario__username',
        'usuario__email',
        'usuario__first_name',
        'usuario__last_name'
    )

    readonly_fields = (
        'fecha_creacion',
    )