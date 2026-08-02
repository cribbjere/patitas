from rest_framework import viewsets

from usuarios.permisos import TienePermisoModulo

from .models import Cliente
from .serializers import ClienteSerializer


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all().order_by(
        'apellido',
        'nombre',
    )

    serializer_class = ClienteSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'clientes'

    roles_solo_lectura = {
        'veterinario',
        'ventas',
    }