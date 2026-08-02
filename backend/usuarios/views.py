from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import (
    action,
    api_view,
    permission_classes,
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response

from .models import PerfilUsuario
from .permisos import EsAdministrador
from .serializers import (
    AdministrarUsuarioSerializer,
    CambiarPasswordSerializer,
    LoginSerializer,
    PerfilUsuarioSerializer,
    RestablecerPasswordSerializer,
    UsuarioSerializer,
)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = (
        User.objects
        .select_related('perfil')
        .all()
        .order_by('username')
    )

    serializer_class = AdministrarUsuarioSerializer
    permission_classes = [EsAdministrador]

    @action(
        detail=True,
        methods=['post'],
        url_path='restablecer-password',
    )
    def restablecer_password(
        self,
        request,
        pk=None,
    ):
        usuario = self.get_object()

        serializer = RestablecerPasswordSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        serializer.guardar_para_usuario(
            usuario,
        )

        # Se elimina cualquier sesión anterior del usuario.
        # Deberá iniciar sesión nuevamente con la
        # contraseña temporal.
        Token.objects.filter(
            user=usuario,
        ).delete()

        return Response(
            {
                'detail': (
                    'La contraseña fue restablecida. '
                    'El usuario deberá cambiarla '
                    'en su próximo inicio de sesión.'
                ),
                'usuario': (
                    AdministrarUsuarioSerializer(
                        usuario,
                    ).data
                ),
            },
            status=status.HTTP_200_OK,
        )


class PerfilUsuarioViewSet(
    viewsets.ReadOnlyModelViewSet
):
    queryset = (
        PerfilUsuario.objects
        .select_related('usuario')
        .all()
        .order_by('usuario__username')
    )

    serializer_class = PerfilUsuarioSerializer
    permission_classes = [EsAdministrador]


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(
        data=request.data,
    )

    serializer.is_valid(
        raise_exception=True,
    )

    username = serializer.validated_data[
        'username'
    ]

    password = serializer.validated_data[
        'password'
    ]

    usuario = authenticate(
        request=request,
        username=username,
        password=password,
    )

    if usuario is None:
        return Response(
            {
                'detail': (
                    'Usuario o contraseña incorrectos.'
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not usuario.is_active:
        return Response(
            {
                'detail': (
                    'Este usuario se encuentra inactivo.'
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if not usuario.is_superuser:
        try:
            perfil = usuario.perfil

        except PerfilUsuario.DoesNotExist:
            return Response(
                {
                    'detail': (
                        'El usuario no tiene '
                        'un perfil asignado.'
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if perfil.estado != 'activo':
            return Response(
                {
                    'detail': (
                        'Este usuario se encuentra inactivo.'
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

    token, _ = Token.objects.get_or_create(
        user=usuario,
    )

    return Response(
        {
            'token': token.key,
            'usuario': UsuarioSerializer(
                usuario,
            ).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cambiar_password(request):
    serializer = CambiarPasswordSerializer(
        data=request.data,
        context={
            'request': request,
        },
    )

    serializer.is_valid(
        raise_exception=True,
    )

    usuario = serializer.save()

    return Response(
        {
            'detail': (
                'La contraseña fue cambiada '
                'correctamente.'
            ),
            'usuario': UsuarioSerializer(
                usuario,
            ).data,
        },
        status=status.HTTP_200_OK,
    )