from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, UsuarioSeguimento, Conquista, UsuarioConquista, Notificacao
 
@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    # Campos extras na página de edição do usuário
    fieldsets = UserAdmin.fieldsets + (
        ('Perfil', {
            'fields': (
                'nome', 'data_nascimento', 'sexo',
                'imagem_perfil_url', 'bio',
                'peso_atual', 'altura_cm',
                'streak_atual', 'maior_streak', 'is_privado',
            )
        }),
    )
    list_display = ('username', 'email', 'nome', 'streak_atual', 'is_active')
 
admin.site.register(UsuarioSeguimento)
admin.site.register(Conquista)
admin.site.register(UsuarioConquista)
admin.site.register(Notificacao)