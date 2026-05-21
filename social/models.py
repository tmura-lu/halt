from django.db import models
from django.conf import settings


class Post(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='posts'
    )
    # Opcional: vincular o post a uma sessão de treino
    sessao_treino = models.ForeignKey(
        'treinos.SessaoTreino', on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='posts'
    )
    titulo = models.CharField(max_length=120)
    conteudo = models.TextField()
    volume_total_post = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    data_post = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
        ordering = ['-data_post']

    def __str__(self):
        return f'{self.titulo} ({self.usuario})'

    @property
    def total_curtidas(self):
        return self.curtidas.count()

    @property
    def total_comentarios(self):
        return self.comentarios.count()


class CurtidaPost(models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name='curtidas'
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='curtidas_dadas'
    )

    class Meta:
        verbose_name = 'Curtida'
        verbose_name_plural = 'Curtidas'
        unique_together = ('post', 'usuario')


class PostImagem(models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name='imagens'
    )
    imagem_url = models.CharField(max_length=500)
    ordem = models.IntegerField(default=0)

    class Meta:
        ordering = ['ordem']
        verbose_name = 'Imagem do Post'
        verbose_name_plural = 'Imagens do Post'


class ComentarioPost(models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name='comentarios'
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='comentarios_feitos'
    )
    mensagem = models.CharField(max_length=500)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Comentário'
        verbose_name_plural = 'Comentários'
        ordering = ['criado_em']

    def __str__(self):
        return f'{self.usuario}: {self.mensagem[:40]}'