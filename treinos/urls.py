from django.urls import path
from . import views
 
urlpatterns = [
    path('', views.principal, name='principal'),
    path('exercicios/', views.exercicios, name='exercicios'),
    path('exercicios/<int:id>/', views.exercicio_detalhes, name='exercicio_detalhes'),
    path('templates/', views.lista_templates, name='lista_templates'),
    path('templates/novo/', views.criar_template, name='criar_template'),
    path('templates/<int:pk>/', views.detalhe_template, name='detalhe_template'),
    path('templates/<int:pk>/deletar/', views.deletar_template, name='deletar_template'),
    path('sessoes/', views.sessoes, name='sessoes'),
    path('sessoes/<int:id>/', views.sessao_detalhes, name='sessao_detalhes'),
    path('dashboard/', views.dashboard, name='dashboard'),
]
 