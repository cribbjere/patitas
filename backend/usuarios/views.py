from django.contrib.auth import authenticate
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import PerfilUsuario
from .serializers import (
    PerfilUsuarioSerializer,
    LoginSerializer,
    UsuarioSerializer,
)


class PerfilUsuarioViewSet(viewsets.ModelViewSet):
    queryset = PerfilUsuario.objects.all()
    serializer_class = PerfilUsuarioSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):

    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    usuario = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )

    if usuario is None:
        return Response(
            {'error': 'Usuario o contraseña incorrectos'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=usuario)

    return Response({
        'token': token.key,
        'usuario': UsuarioSerializer(usuario).data,
    })