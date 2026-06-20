from django.contrib import admin
from .models import Consulta, Vacunacion, Cirugia


admin.site.register(Consulta)
admin.site.register(Vacunacion)
admin.site.register(Cirugia)