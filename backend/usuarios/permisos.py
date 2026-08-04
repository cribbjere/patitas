from rest_framework.permissions import (
    BasePermission,
    SAFE_METHODS,
)


PERMISOS_POR_ROL = {
    'administrador': {
        'dashboard',
        'clientes',
        'mascotas',
        'turnos',
        'consultas',
        'vacunaciones',
        'cirugias',
        'higiene',
        'productos',
        'stock',
        'consumo_insumos',
        'proveedores',
        'compras',
        'ventas',
        'pagos',
        'caja',
        'reportes',
        'usuarios',
        'configuracion',
        'servicios',
    },

    'recepcionista': {
        'dashboard',
        'clientes',
        'mascotas',
        'turnos',
        'higiene',
        'ventas',
        'pagos',
        'caja',
        'servicios',
    },

    'veterinario': {
        'dashboard',
        'clientes',
        'mascotas',
        'turnos',
        'consultas',
        'vacunaciones',
        'cirugias',
        'consumo_insumos',
        'reportes',
        'servicios',
    },

    'ventas': {
        'dashboard',
        'clientes',
        'productos',
        'stock',
        'proveedores',
        'compras',
        'ventas',
        'pagos',
        'caja',
        'reportes',
        'servicios',
    },

    'higiene': {
        'dashboard',
        'mascotas',
        'turnos',
        'higiene',
        'consumo_insumos',
        'servicios',
    },
}


def es_endpoint_cambio_password(request):
    """
    Permite reconocer el único endpoint habilitado
    mientras el usuario tiene una contraseña temporal.
    """
    ruta = str(
        getattr(request, 'path', '')
    ).rstrip('/').lower()

    if ruta == '/api/cambiar-password':
        return True

    resolver_match = getattr(
        request,
        'resolver_match',
        None,
    )

    nombre_url = str(
        getattr(
            resolver_match,
            'url_name',
            '',
        )
    ).strip().lower().replace('_', '-')

    return nombre_url == 'cambiar-password'


def tiene_password_temporal(perfil):
    return bool(
        perfil
        and getattr(
            perfil,
            'debe_cambiar_password',
            False,
        )
    )


def acceso_bloqueado_por_password(
    request,
    perfil,
):
    return (
        tiene_password_temporal(perfil)
        and not es_endpoint_cambio_password(
            request
        )
    )


class EsAdministrador(BasePermission):
    message = (
        'Solo un administrador puede realizar '
        'esta operación.'
    )

    def has_permission(self, request, view):
        usuario = request.user

        if (
            not usuario
            or not usuario.is_authenticated
        ):
            return False

        if not usuario.is_active:
            self.message = (
                'Tu usuario se encuentra inactivo.'
            )
            return False

        perfil = getattr(
            usuario,
            'perfil',
            None,
        )

        if acceso_bloqueado_por_password(
            request,
            perfil,
        ):
            self.message = (
                'Debés cambiar tu contraseña temporal '
                'antes de continuar.'
            )
            return False

        if usuario.is_superuser:
            return True

        if not perfil:
            self.message = (
                'El usuario no tiene un perfil '
                'configurado.'
            )
            return False

        return (
            perfil.estado == 'activo'
            and str(
                perfil.rol
            ).strip().lower()
            == 'administrador'
        )


class TienePermisoModulo(BasePermission):
    message = (
        'No tenés permiso para acceder '
        'a este módulo.'
    )

    def has_permission(self, request, view):
        usuario = request.user

        if (
            not usuario
            or not usuario.is_authenticated
        ):
            return False

        if not usuario.is_active:
            self.message = (
                'Tu usuario se encuentra inactivo.'
            )
            return False

        perfil = getattr(
            usuario,
            'perfil',
            None,
        )

        if acceso_bloqueado_por_password(
            request,
            perfil,
        ):
            self.message = (
                'Debés cambiar tu contraseña temporal '
                'antes de continuar.'
            )
            return False

        if usuario.is_superuser:
            return True

        if (
            not perfil
            or perfil.estado != 'activo'
        ):
            self.message = (
                'Tu perfil no se encuentra activo.'
            )
            return False

        modulo = getattr(
            view,
            'modulo_permiso',
            None,
        )

        if not modulo:
            self.message = (
                'El módulo no tiene permisos '
                'configurados.'
            )
            return False

        rol_normalizado = str(
            perfil.rol
        ).strip().lower()

        modulo_normalizado = str(
            modulo
        ).strip().lower()

        permisos = PERMISOS_POR_ROL.get(
            rol_normalizado,
            set(),
        )

        if modulo_normalizado not in permisos:
            self.message = (
                'No tenés permiso para acceder '
                'a este módulo.'
            )
            return False

        roles_permitidos_config = getattr(
            view,
            'roles_permitidos',
            None,
        )

        if roles_permitidos_config:
            roles_permitidos = {
                str(rol).strip().lower()
                for rol in roles_permitidos_config
            }

            if (
                rol_normalizado
                not in roles_permitidos
            ):
                self.message = (
                    'Tu rol no tiene permiso para '
                    'realizar esta operación.'
                )
                return False

        # Los roles indicados en la vista pueden
        # realizar únicamente GET, HEAD y OPTIONS.
        roles_solo_lectura = {
            str(rol).strip().lower()
            for rol in getattr(
                view,
                'roles_solo_lectura',
                set(),
            )
        }

        if (
            rol_normalizado
            in roles_solo_lectura
            and request.method
            not in SAFE_METHODS
        ):
            self.message = (
                'Tu rol solamente puede consultar '
                'la información de este módulo.'
            )
            return False

        return True