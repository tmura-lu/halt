from django.contrib.auth.models import AbstractUser
from django.db import models


class SexoChoices(models.TextChoices):
    MASCULINO = 'M', 'Masculino'
    FEMININO = 'F', 'Feminino'
    OUTRO = 'O', 'Outro'


class TipoNotificacaoChoices(models.TextChoices):
    SEGUIMENTO = 'SEGUIMENTO', 'Seguimento'
    CURTIDA = 'CURTIDA', 'Curtida'
    COMENTARIO = 'COMENTARIO', 'Comentário'
    CONQUISTA = 'CONQUISTA', 'Conquista'


class Usuario(AbstractUser):
    """
    Substitui o User padrão do Django.
    Lembre de adicionar AUTH_USER_MODEL = 'usuarios.Usuario' no settings.py
    """
    nome = models.CharField(max_length=50, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    sexo = models.CharField(
        max_length=1, choices=SexoChoices.choices, null=True, blank=True
    )
    imagem_perfil_url = models.CharField(max_length=500, null=True, blank=True)
    bio = models.CharField(max_length=160, null=True, blank=True)
    peso_atual = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    altura_cm = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    streak_atual = models.IntegerField(default=0)
    maior_streak = models.IntegerField(default=0)
    is_privado = models.BooleanField(default=False)
    atualizado_em = models.DateTimeField(auto_now=True)

    # Herdados do AbstractUser:
    # username, email, password, is_active (is_ativo), date_joined (criado_em)

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return self.username


class UsuarioSeguimento(models.Model):
    seguidor = models.ForeignKey(
        Usuario, on_delete=models.CASCADE, related_name='seguindo'
    )
    seguido = models.ForeignKey(
        Usuario, on_delete=models.CASCADE, related_name='seguidores'
    )
    is_ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Seguimento'
        verbose_name_plural = 'Seguimentos'
        unique_together = ('seguidor', 'seguido')

    def __str__(self):
        return f'{self.seguidor} → {self.seguido}'


class Conquista(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    icone_url = models.CharField(max_length=500, null=True, blank=True)
    xp_recompensa = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Conquista'
        verbose_name_plural = 'Conquistas'

    def __str__(self):
        return self.nome


class UsuarioConquista(models.Model):
    usuario = models.ForeignKey(
        Usuario, on_delete=models.CASCADE, related_name='conquistas'
    )
    conquista = models.ForeignKey(Conquista, on_delete=models.CASCADE)
    conquistado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Conquista do Usuário'
        verbose_name_plural = 'Conquistas dos Usuários'
        unique_together = ('usuario', 'conquista')


class Notificacao(models.Model):
    usuario_destino = models.ForeignKey(
        Usuario, on_delete=models.CASCADE, related_name='notificacoes_recebidas'
    )
    usuario_origem = models.ForeignKey(
        Usuario, on_delete=models.CASCADE,
        related_name='notificacoes_enviadas',
        null=True, blank=True
    )
    tipo = models.CharField(max_length=20, choices=TipoNotificacaoChoices.choices)
    mensagem = models.CharField(max_length=300)
    is_lida = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'
        ordering = ['-criado_em']

    def __str__(self):
        return f'{self.tipo} → {self.usuario_destino}'