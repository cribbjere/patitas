from django.contrib import admin

from .models import (
    Consulta,
    Vacunacion,
    Cirugia,
    ServicioHigiene
)


@admin.register(Consulta)
class ConsultaAdmin(admin.ModelAdmin):

    list_display = (
        'fecha_consulta',
        'mascota',
        'servicio',
        'precio',
        'usuario'
    )

    list_filter = (
        'fecha_consulta',
        'servicio'
    )

    search_fields = (
        'mascota__nombre',
    )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):

        if db_field.name == "servicio":
            kwargs["queryset"] = db_field.remote_field.model.objects.filter(
                categoria='consulta',
                estado='activo'
            )

        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(Vacunacion)
class VacunacionAdmin(admin.ModelAdmin):

    list_display = (
        'fecha_aplicacion',
        'mascota',
        'servicio',
        'precio',
        'proxima_dosis'
    )

    list_filter = (
        'servicio',
        'fecha_aplicacion'
    )

    search_fields = (
        'mascota__nombre',
    )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):

        if db_field.name == "servicio":
            kwargs["queryset"] = db_field.remote_field.model.objects.filter(
                categoria='vacunacion',
                estado='activo'
            )

        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(Cirugia)
class CirugiaAdmin(admin.ModelAdmin):

    list_display = (
        'fecha',
        'mascota',
        'servicio',
        'precio',
        'estado'
    )

    list_filter = (
        'estado',
        'servicio'
    )

    search_fields = (
        'mascota__nombre',
    )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):

        if db_field.name == "servicio":
            kwargs["queryset"] = db_field.remote_field.model.objects.filter(
                categoria='cirugia',
                estado='activo'
            )

        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(ServicioHigiene)
class ServicioHigieneAdmin(admin.ModelAdmin):

    list_display = (
        'fecha',
        'mascota',
        'servicio',
        'precio',
        'estado'
    )

    list_filter = (
        'estado',
        'servicio'
    )

    search_fields = (
        'mascota__nombre',
    )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):

        if db_field.name == "servicio":
            kwargs["queryset"] = db_field.remote_field.model.objects.filter(
                categoria='higiene',
                estado='activo'
            )

        return super().formfield_for_foreignkey(
            db_field,
            request,
            **kwargs
        )