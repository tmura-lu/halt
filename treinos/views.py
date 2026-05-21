from django.http import HttpResponse
from django.template import loader
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages

from .models import Exercicio, TreinoTemplate, SessaoTreino, TreinoExercicioTemplate

def principal(request):
    qtd_exercicios = Exercicio.objects.count()
    if request.user.is_authenticated:
        qtd_templates = TreinoTemplate.objects.filter(usuario=request.user).count()
        qtd_sessoes = SessaoTreino.objects.filter(usuario=request.user).count()
    else:
        qtd_templates = 0
        qtd_sessoes = 0
    context = {
        'data': [qtd_exercicios, qtd_templates, qtd_sessoes],
    }
    template = loader.get_template('principal.html')
    return HttpResponse(template.render(context, request))

def exercicios(request):
    exercicios = Exercicio.objects.all().values()
    context = {
        'exercicios': exercicios,
    }
    template = loader.get_template('exercicios.html')
    return HttpResponse(template.render(context, request))


def exercicio_detalhes(request, id):
    exercicio = Exercicio.objects.get(id=id)
    context = {
        'exercicio': exercicio,
    }
    template = loader.get_template('exercicio_detalhes.html')
    return HttpResponse(template.render(context, request))


@login_required(login_url="/auth/login")
def sessoes(request):
    sessoes = SessaoTreino.objects.filter(usuario=request.user).values()
    context = {
        'sessoes': sessoes,
    }
    template = loader.get_template('sessoes.html')
    return HttpResponse(template.render(context, request))


@login_required(login_url="/auth/login")
def dashboard(request):
    qtd_exercicios = Exercicio.objects.count()
    qtd_templates = TreinoTemplate.objects.count()
    qtd_sessoes = SessaoTreino.objects.filter(usuario=request.user).count()
    context = {
        'labels': ['Exercícios', 'Templates', 'Sessões'],
        'data': [qtd_exercicios, qtd_templates, qtd_sessoes],
    }
    template = loader.get_template('dashboard.html')
    return HttpResponse(template.render(context, request))


@login_required(login_url="/auth/login")
def sessao_detalhes(request, id):
    sessao = SessaoTreino.objects.get(id=id)
    context = {
        'sessao': sessao,
    }
    template = loader.get_template('sessao_detalhes.html')
    return HttpResponse(template.render(context, request))







@login_required
def lista_templates(request):
    templates = TreinoTemplate.objects.filter(usuario=request.user).order_by('-criado_em')
    return render(request, 'templates.html', {'templates': templates})
 
 
@login_required
def criar_template(request):
    exercicios = Exercicio.objects.all().order_by('nome')
 
    if request.method == 'GET':
        return render(request, 'criar_template.html', {'exercicios': exercicios})
 
    # Dados do template
    nome = request.POST.get('nome', '').strip()
    descricao = request.POST.get('descricao', '').strip()
    is_publico = request.POST.get('is_publico') == 'on'
 
    if not nome:
        messages.error(request, 'O template precisa de um nome.')
        return render(request, 'criar_template.html', {'exercicios': exercicios})
 
    template = TreinoTemplate.objects.create(
        usuario=request.user,
        nome=nome,
        descricao=descricao,
        is_publico=is_publico,
    )
 
    # Os exercícios chegam como listas paralelas do formulário:
    # exercicio_ids[], ordens[], series[], descansos[]
    exercicio_ids = request.POST.getlist('exercicio_id')
    ordens = request.POST.getlist('ordem')
    series = request.POST.getlist('series_sugeridas')
    descansos = request.POST.getlist('descanso_segundos')
 
    for i, ex_id in enumerate(exercicio_ids):
        if not ex_id:
            continue
        TreinoExercicioTemplate.objects.create(
            treino_template=template,
            exercicio_id=ex_id,
            ordem=ordens[i] if i < len(ordens) else i + 1,
            series_sugeridas=series[i] if series[i] else None,
            descanso_segundos=descansos[i] if descansos[i] else None,
        )
 
    messages.success(request, f'Template "{nome}" criado com sucesso!')
    return redirect('lista_templates')
 
 
@login_required
def detalhe_template(request, pk):
    template = get_object_or_404(TreinoTemplate, pk=pk, usuario=request.user)
    exercicios = template.exercicios.select_related('exercicio').order_by('ordem')
    return render(request, 'template_detalhes.html', {
        'template': template,
        'exercicios': exercicios,
    })
 
 
@login_required
def deletar_template(request, pk):
    template = get_object_or_404(TreinoTemplate, pk=pk, usuario=request.user)
    template.delete()
    messages.success(request, 'Template deletado.')
    return redirect('lista_templates')