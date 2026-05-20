from django.contrib import admin
from .models import (
    Musculo, Exercicio, ExercicioMusculo,
    TreinoTemplate, TreinoExercicioTemplate,
    SessaoTreino, SessaoExercicio, Serie, RecordePessoal
)
 
admin.site.register(Musculo)
admin.site.register(Exercicio)
admin.site.register(ExercicioMusculo)
admin.site.register(TreinoTemplate)
admin.site.register(TreinoExercicioTemplate)
admin.site.register(SessaoTreino)
admin.site.register(SessaoExercicio)
admin.site.register(Serie)
admin.site.register(RecordePessoal)