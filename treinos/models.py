from django.db import models
from django.conf import settings


class Musculo(models.Model):
    nome = models.CharField(max_length=60)

    class Meta:
        verbose_name = 'Músculo'
        verbose_name_plural = 'Músculos'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Exercicio(models.Model):
    nome = models.CharField(max_length=50)
    imagem_url = models.CharField(max_length=500, null=True, blank=True)
    gif_url = models.CharField(max_length=500, null=True, blank=True)
    descricao = models.TextField(null=True, blank=True)
    equipamento = models.CharField(max_length=60, null=True, blank=True)
    categoria = models.CharField(max_length=60, null=True, blank=True)
    musculos = models.ManyToManyField(
        Musculo, through='ExercicioMusculo', related_name='exercicios'
    )
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Exercício'
        verbose_name_plural = 'Exercícios'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class ExercicioMusculo(models.Model):
    """Tabela intermediária para indicar quais músculos cada exercício trabalha."""
    exercicio = models.ForeignKey(Exercicio, on_delete=models.CASCADE)
    musculo = models.ForeignKey(Musculo, on_delete=models.CASCADE)
    is_principal = models.BooleanField(default=False)

    class Meta:
        unique_together = ('exercicio', 'musculo')


class TreinoTemplate(models.Model):
    """Modelo/roteiro de treino criado pelo usuário."""
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='treinos_template'
    )
    nome = models.CharField(max_length=60)
    descricao = models.TextField(null=True, blank=True)
    is_publico = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Template de Treino'
        verbose_name_plural = 'Templates de Treino'

    def __str__(self):
        return f'{self.nome} ({self.usuario})'


class TreinoExercicioTemplate(models.Model):
    """Exercícios dentro de um template de treino, com ordem e sugestões."""
    treino_template = models.ForeignKey(
        TreinoTemplate, on_delete=models.CASCADE, related_name='exercicios'
    )
    exercicio = models.ForeignKey(Exercicio, on_delete=models.CASCADE)
    ordem = models.IntegerField()
    series_sugeridas = models.SmallIntegerField(null=True, blank=True)
    descanso_segundos = models.SmallIntegerField(null=True, blank=True)

    class Meta:
        ordering = ['ordem']
        verbose_name = 'Exercício no Template'
        verbose_name_plural = 'Exercícios no Template'


class SessaoTreino(models.Model):
    """Registro de um treino realizado pelo usuário."""
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='sessoes_treino'
    )
    treino_template = models.ForeignKey(
        TreinoTemplate, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='sessoes'
    )
    iniciado_em = models.DateTimeField(auto_now_add=True)
    finalizado_em = models.DateTimeField(null=True, blank=True)
    volume_total_kg = models.DecimalField(
        max_digits=8, decimal_places=2, default=0
    )
    observacao = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name = 'Sessão de Treino'
        verbose_name_plural = 'Sessões de Treino'
        ordering = ['-iniciado_em']

    def __str__(self):
        return f'Treino de {self.usuario} em {self.iniciado_em:%d/%m/%Y}'


class SessaoExercicio(models.Model):
    """Um exercício dentro de uma sessão de treino."""
    sessao_treino = models.ForeignKey(
        SessaoTreino, on_delete=models.CASCADE, related_name='exercicios'
    )
    exercicio = models.ForeignKey(Exercicio, on_delete=models.CASCADE)
    ordem = models.IntegerField()
    anotacao_performance = models.CharField(max_length=500, null=True, blank=True)

    class Meta:
        ordering = ['ordem']
        verbose_name = 'Exercício na Sessão'
        verbose_name_plural = 'Exercícios na Sessão'

    def __str__(self):
        return f'{self.exercicio} (sessão {self.sessao_treino_id})'


class TipoSerieChoices(models.TextChoices):
    NORMAL = 'NORMAL', 'Normal'
    AQUECIMENTO = 'AQUECIMENTO', 'Aquecimento'
    DROP = 'DROP', 'Drop Set'
    FALHA = 'FALHA', 'Até a Falha'


class Serie(models.Model):
    """Uma série dentro de um exercício de sessão."""
    sessao_exercicio = models.ForeignKey(
        SessaoExercicio, on_delete=models.CASCADE, related_name='series'
    )
    numero_serie = models.SmallIntegerField()
    peso_kg = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True
    )
    repeticoes = models.SmallIntegerField(null=True, blank=True)
    tipo_serie = models.CharField(
        max_length=20,
        choices=TipoSerieChoices.choices,
        default=TipoSerieChoices.NORMAL
    )
    rr = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text='RPE/RIR ou outra métrica de esforço'
    )
    volume_serie = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['numero_serie']
        verbose_name = 'Série'
        verbose_name_plural = 'Séries'

    def save(self, *args, **kwargs):
        # Calcula volume automaticamente se tiver peso e reps
        if self.peso_kg and self.repeticoes:
            self.volume_serie = self.peso_kg * self.repeticoes
        super().save(*args, **kwargs)


class RecordePessoal(models.Model):
    """Melhor desempenho do usuário em um exercício."""
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='recordes_pessoais'
    )
    exercicio = models.ForeignKey(Exercicio, on_delete=models.CASCADE)
    valor_1rm_estimado = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True
    )
    maior_peso_kg = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True
    )
    data_conquista = models.DateField(auto_now=True)

    class Meta:
        verbose_name = 'Recorde Pessoal'
        verbose_name_plural = 'Recordes Pessoais'
        unique_together = ('usuario', 'exercicio')

    def __str__(self):
        return f'{self.usuario} - {self.exercicio}: {self.maior_peso_kg}kg'