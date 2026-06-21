from django.contrib import admin
from .models import Consulta, Vacunacion, Cirugia, ServicioHigiene


admin.site.register(Consulta)
admin.site.register(Vacunacion)
admin.site.register(Cirugia)
admin.site.register(ServicioHigiene)