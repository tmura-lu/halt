from django.contrib import admin
from .models import Post, CurtidaPost, PostImagem, ComentarioPost
 
admin.site.register(Post)
admin.site.register(CurtidaPost)
admin.site.register(PostImagem)
admin.site.register(ComentarioPost)