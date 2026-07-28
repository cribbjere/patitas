from rest_framework.permissions import BasePermission


class EsAdministrador(BasePermission):
    message = 'Solo un administrador puede realizar esta operación.'

    def has_permission(self, request, view):
        usuario = request.user

        if not usuario or not usuario.is_authenticated:
            return False

        # Los superusuarios de Django tienen acceso total.
        if usuario.is_superuser:
            return True

        try:
            return (
                usuario.perfil.rol == 'administrador'
                and usuario.perfil.estado == 'activo'
            )
        except AttributeError:
            return False