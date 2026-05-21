# treinos/admin.py
from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Exercicio,
    ExercicioMusculo,
    Musculo,
    RecordePessoal,
    Serie,
    SessaoExercicio,
    SessaoTreino,
    TreinoExercicioTemplate,
    TreinoTemplate,
)


# ─────────────────────────────────────────────
#  Inlines
# ─────────────────────────────────────────────

class ExercicioMusculoInline(admin.TabularInline):
    """Músculos trabalhados diretamente na tela do Exercício."""
    model = ExercicioMusculo
    extra = 1
    autocomplete_fields = ('musculo',)
    fields = ('musculo', 'is_principal')


class TreinoExercicioTemplateInline(admin.TabularInline):
    """Exercícios que compõem um Template de Treino."""
    model = TreinoExercicioTemplate
    extra = 1
    autocomplete_fields = ('exercicio',)
    fields = ('ordem', 'exercicio', 'series_sugeridas', 'descanso_segundos')
    ordering = ('ordem',)


class SessaoExercicioInline(admin.TabularInline):
    """Exercícios realizados em uma Sessão de Treino."""
    model = SessaoExercicio
    extra = 0
    readonly_fields = ('anotacao_performance',)
    autocomplete_fields = ('exercicio',)
    fields = ('ordem', 'exercicio', 'anotacao_performance')
    ordering = ('ordem',)
    show_change_link = True  # link para abrir o SessaoExercicio e ver as séries


class SerieInline(admin.TabularInline):
    """Séries de um Exercício na Sessão — filho de SessaoExercicio."""
    model = Serie
    extra = 0
    readonly_fields = ('volume_serie', 'criado_em')
    fields = (
        'numero_serie',
        'tipo_serie',
        'peso_kg',
        'repeticoes',
        'rr',
        'volume_serie',
    )
    ordering = ('numero_serie',)


# ─────────────────────────────────────────────
#  ModelAdmins
# ─────────────────────────────────────────────

@admin.register(Musculo)
class MusculoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'total_exercicios')
    search_fields = ('nome',)
    ordering = ('nome',)

    @admin.display(description='Exercícios')
    def total_exercicios(self, obj):
        return obj.exercicios.count()


@admin.register(Exercicio)
class ExercicioAdmin(admin.ModelAdmin):
    list_display = (
        'nome',
        'categoria',
        'equipamento',
        'musculos_principais',
        'gif_preview',
        'criado_em',
    )
    list_filter = ('categoria', 'equipamento')
    search_fields = ('nome', 'categoria', 'equipamento', 'descricao')
    ordering = ('nome',)
    date_hierarchy = 'criado_em'
    inlines = [ExercicioMusculoInline]

    @admin.display(description='Músculos Principais')
    def musculos_principais(self, obj):
        principais = obj.exerciciomusculo_set.filter(
            is_principal=True
        ).select_related('musculo')
        nomes = [em.musculo.nome for em in principais]
        return ', '.join(nomes) if nomes else '—'

    @admin.display(description='GIF')
    def gif_preview(self, obj):
        if obj.gif_url:
            return format_html(
                '<img src="{}" style="height:40px; border-radius:4px;" />',
                obj.gif_url,
            )
        return '—'


@admin.register(TreinoTemplate)
class TreinoTemplateAdmin(admin.ModelAdmin):
    list_display = (
        'nome',
        'usuario',
        'is_publico',
        'total_exercicios',
        'criado_em',
    )
    list_filter = ('is_publico',)
    search_fields = ('nome', 'usuario__username', 'usuario__email', 'descricao')
    readonly_fields = ('criado_em',)
    autocomplete_fields = ('usuario',)
    date_hierarchy = 'criado_em'
    inlines = [TreinoExercicioTemplateInline]

    @admin.display(description='Nº Exercícios')
    def total_exercicios(self, obj):
        return obj.exercicios.count()


@admin.register(SessaoTreino)
class SessaoTreinoAdmin(admin.ModelAdmin):
    list_display = (
        'usuario',
        'treino_template',
        'iniciado_em',
        'finalizado_em',
        'volume_total_kg',
        'duracao',
    )
    list_filter = ('treino_template',)
    search_fields = (
        'usuario__username',
        'usuario__email',
        'treino_template__nome',
    )
    readonly_fields = ('iniciado_em', 'volume_total_kg')
    autocomplete_fields = ('usuario', 'treino_template')
    date_hierarchy = 'iniciado_em'
    ordering = ('-iniciado_em',)
    inlines = [SessaoExercicioInline]

    @admin.display(description='Duração')
    def duracao(self, obj):
        if obj.finalizado_em and obj.iniciado_em:
            delta = obj.finalizado_em - obj.iniciado_em
            total_min = int(delta.total_seconds() // 60)
            horas, minutos = divmod(total_min, 60)
            if horas:
                return f'{horas}h {minutos}min'
            return f'{minutos}min'
        return '—'


@admin.register(SessaoExercicio)
class SessaoExercicioAdmin(admin.ModelAdmin):
    """
    Permite visualizar/editar um exercício de sessão isoladamente
    e ver todas as suas séries via inline.
    """
    list_display = (
        'exercicio',
        'sessao_treino',
        'ordem',
        'total_series',
    )
    search_fields = (
        'exercicio__nome',
        'sessao_treino__usuario__username',
    )
    autocomplete_fields = ('exercicio',)
    readonly_fields = ('sessao_treino',)
    inlines = [SerieInline]

    @admin.display(description='Séries')
    def total_series(self, obj):
        return obj.series.count()


@admin.register(Serie)
class SerieAdmin(admin.ModelAdmin):
    list_display = (
        'sessao_exercicio',
        'numero_serie',
        'tipo_serie',
        'peso_kg',
        'repeticoes',
        'volume_serie',
    )
    list_filter = ('tipo_serie',)
    search_fields = (
        'sessao_exercicio__exercicio__nome',
        'sessao_exercicio__sessao_treino__usuario__username',
    )
    readonly_fields = ('volume_serie', 'criado_em')


@admin.register(RecordePessoal)
class RecordePessoalAdmin(admin.ModelAdmin):
    list_display = (
        'usuario',
        'exercicio',
        'maior_peso_kg',
        'valor_1rm_estimado',
        'data_conquista',
    )
    list_filter = ('exercicio',)
    search_fields = (
        'usuario__username',
        'usuario__email',
        'exercicio__nome',
    )
    readonly_fields = ('data_conquista',)
    autocomplete_fields = ('usuario', 'exercicio')
    date_hierarchy = 'data_conquista'
    ordering = ('-maior_peso_kg',)