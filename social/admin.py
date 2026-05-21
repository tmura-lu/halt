# social/admin.py
from django.contrib import admin
from django.utils.html import format_html

from .models import (
    ComentarioPost,
    CurtidaPost,
    Post,
    PostImagem,
)


# ─────────────────────────────────────────────
#  Inlines
# ─────────────────────────────────────────────

class PostImagemInline(admin.TabularInline):
    """Imagens do Post na mesma tela de edição."""
    model = PostImagem
    extra = 1
    fields = ('ordem', 'imagem_url', 'preview')
    readonly_fields = ('preview',)
    ordering = ('ordem',)

    @admin.display(description='Preview')
    def preview(self, obj):
        if obj.imagem_url:
            return format_html(
                '<img src="{}" style="height:60px; border-radius:6px;" />',
                obj.imagem_url,
            )
        return '—'


class ComentarioPostInline(admin.TabularInline):
    """Comentários do Post na mesma tela de edição."""
    model = ComentarioPost
    extra = 0
    readonly_fields = ('usuario', 'criado_em')
    fields = ('usuario', 'mensagem', 'criado_em')
    ordering = ('criado_em',)
    show_change_link = True


class CurtidaPostInline(admin.TabularInline):
    """Curtidas do Post na mesma tela de edição."""
    model = CurtidaPost
    extra = 0
    readonly_fields = ('usuario',)
    fields = ('usuario',)
    verbose_name = 'Curtida'
    verbose_name_plural = 'Curtidas'
    can_delete = True


# ─────────────────────────────────────────────
#  ModelAdmins
# ─────────────────────────────────────────────

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        'titulo',
        'usuario',
        'sessao_treino',
        'volume_total_post',
        'curtidas_count',
        'comentarios_count',
        'data_post',
    )
    list_filter = (
        # Filtra se o post está vinculado a uma sessão de treino
        ('sessao_treino', admin.EmptyFieldListFilter),
    )
    search_fields = (
        'titulo',
        'conteudo',
        'usuario__username',
        'usuario__email',
    )
    readonly_fields = ('data_post', 'volume_total_post')
    autocomplete_fields = ('usuario',)
    date_hierarchy = 'data_post'
    ordering = ('-data_post',)
    list_per_page = 25
    inlines = [PostImagemInline, ComentarioPostInline, CurtidaPostInline]

    # ── Colunas calculadas ────────────────────

    @admin.display(description='❤ Curtidas', ordering='curtidas')
    def curtidas_count(self, obj):
        count = obj.curtidas.count()
        # Destaca posts com muitas curtidas
        if count >= 50:
            return format_html(
                '<strong style="color:#e74c3c;">{}</strong>', count
            )
        return count

    @admin.display(description='💬 Comentários')
    def comentarios_count(self, obj):
        return obj.comentarios.count()

    # ── Otimização de queries ─────────────────

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('usuario', 'sessao_treino').prefetch_related(
            'curtidas', 'comentarios'
        )


@admin.register(CurtidaPost)
class CurtidaPostAdmin(admin.ModelAdmin):
    list_display = ('post', 'usuario')
    search_fields = (
        'post__titulo',
        'usuario__username',
        'usuario__email',
    )
    autocomplete_fields = ('usuario',)
    list_select_related = ('post', 'usuario')


@admin.register(ComentarioPost)
class ComentarioPostAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'post', 'mensagem_resumida', 'criado_em')
    search_fields = (
        'usuario__username',
        'usuario__email',
        'post__titulo',
        'mensagem',
    )
    readonly_fields = ('criado_em',)
    autocomplete_fields = ('usuario', 'post')
    date_hierarchy = 'criado_em'
    ordering = ('-criado_em',)
    list_per_page = 50

    @admin.display(description='Mensagem')
    def mensagem_resumida(self, obj):
        return obj.mensagem[:60] + ('…' if len(obj.mensagem) > 60 else '')