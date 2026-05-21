# usuarios/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html

from .models import (
    Conquista,
    Notificacao,
    Usuario,
    UsuarioConquista,
    UsuarioSeguimento,
)


# ─────────────────────────────────────────────
#  Inlines
# ─────────────────────────────────────────────

class UsuarioConquistaInline(admin.TabularInline):
    """Conquistas desbloqueadas diretamente na tela do Usuário."""
    model = UsuarioConquista
    extra = 0
    readonly_fields = ('conquistado_em',)
    autocomplete_fields = ('conquista',)


class UsuarioSeguimentoSeguidorInline(admin.TabularInline):
    """Pessoas que este usuário SEGUE (seguindo →)."""
    model = UsuarioSeguimento
    fk_name = 'seguidor'
    verbose_name = 'Usuário seguido'
    verbose_name_plural = 'Usuários que este perfil segue'
    extra = 0
    readonly_fields = ('criado_em',)
    autocomplete_fields = ('seguido',)


class UsuarioSeguimentoSeguidoInline(admin.TabularInline):
    """Pessoas que SEGUEM este usuário (seguidores ←)."""
    model = UsuarioSeguimento
    fk_name = 'seguido'
    verbose_name = 'Seguidor'
    verbose_name_plural = 'Seguidores deste perfil'
    extra = 0
    readonly_fields = ('criado_em',)
    autocomplete_fields = ('seguidor',)


# ─────────────────────────────────────────────
#  ModelAdmins
# ─────────────────────────────────────────────

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    """
    Estende o UserAdmin padrão para incluir os campos customizados.
    UserAdmin já traz list_display, search_fields e filtros de autenticação.
    """

    # ── Listagem ──────────────────────────────
    list_display = (
        'username',
        'nome',
        'email',
        'sexo',
        'streak_atual',
        'maior_streak',
        'is_privado',
        'is_active',
        'is_staff',
        'date_joined',
    )
    list_display_links = ('username', 'nome')
    list_filter = (
        'is_active',
        'is_staff',
        'is_superuser',
        'is_privado',
        'sexo',
        'groups',
    )
    search_fields = ('username', 'email', 'nome', 'bio')
    ordering = ('-date_joined',)
    list_per_page = 30

    # ── Formulário de edição ──────────────────
    # Adiciona seção com os campos customizados ao formulário herdado do UserAdmin
    fieldsets = UserAdmin.fieldsets + (
        (
            'Perfil',
            {
                'fields': (
                    'nome',
                    'data_nascimento',
                    'sexo',
                    'imagem_perfil_url',
                    'bio',
                    'peso_atual',
                    'altura_cm',
                    'is_privado',
                )
            },
        ),
        (
            'Estatísticas de Treino',
            {
                'fields': ('streak_atual', 'maior_streak'),
                'classes': ('collapse',),
            },
        ),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            'Perfil (opcional)',
            {
                'classes': ('wide',),
                'fields': ('email', 'nome', 'sexo'),
            },
        ),
    )
    readonly_fields = ('date_joined', 'last_login', 'atualizado_em')

    # ── Inlines ───────────────────────────────
    inlines = [
        UsuarioConquistaInline,
        UsuarioSeguimentoSeguidorInline,
        UsuarioSeguimentoSeguidoInline,
    ]


@admin.register(UsuarioSeguimento)
class UsuarioSeguimentoAdmin(admin.ModelAdmin):
    list_display = ('seguidor', 'seguido', 'is_ativo', 'criado_em')
    list_filter = ('is_ativo',)
    search_fields = (
        'seguidor__username',
        'seguidor__email',
        'seguido__username',
        'seguido__email',
    )
    readonly_fields = ('criado_em',)
    autocomplete_fields = ('seguidor', 'seguido')
    date_hierarchy = 'criado_em'


@admin.register(Conquista)
class ConquistaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'xp_recompensa', 'icone_preview')
    search_fields = ('nome', 'descricao')
    ordering = ('-xp_recompensa', 'nome')

    @admin.display(description='Ícone')
    def icone_preview(self, obj):
        if obj.icone_url:
            return format_html(
                '<img src="{}" style="height:32px; border-radius:4px;" />',
                obj.icone_url,
            )
        return '—'


@admin.register(UsuarioConquista)
class UsuarioConquistaAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'conquista', 'conquistado_em')
    list_filter = ('conquista',)
    search_fields = ('usuario__username', 'conquista__nome')
    readonly_fields = ('conquistado_em',)
    autocomplete_fields = ('usuario', 'conquista')
    date_hierarchy = 'conquistado_em'


@admin.register(Notificacao)
class NotificacaoAdmin(admin.ModelAdmin):
    list_display = (
        'tipo',
        'usuario_destino',
        'usuario_origem',
        'mensagem_resumida',
        'is_lida',
        'criado_em',
    )
    list_filter = ('tipo', 'is_lida')
    search_fields = (
        'usuario_destino__username',
        'usuario_origem__username',
        'mensagem',
    )
    readonly_fields = ('criado_em',)
    autocomplete_fields = ('usuario_destino', 'usuario_origem')
    date_hierarchy = 'criado_em'
    list_per_page = 50

    @admin.display(description='Mensagem')
    def mensagem_resumida(self, obj):
        return obj.mensagem[:60] + ('…' if len(obj.mensagem) > 60 else '')