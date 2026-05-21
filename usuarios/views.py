from django.shortcuts import render, redirect
from django.http import HttpResponse    
from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth import login as login_django
from django.contrib.auth import logout as logout_django
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model


User = get_user_model()
 
 
def login(request):
    if request.method == "GET":
        return render(request, 'login.html')
 
    usuario = request.POST.get('usuario')
    senha = request.POST.get('senha')
 
    user = authenticate(username=usuario, password=senha)
    if user:
        login_django(request, user)
        return redirect('principal')
    else:
        messages.error(request, 'Usuário ou senha inválidos. Tente novamente.')
        return render(request, 'login.html')
 
 
def cadastro(request):
    if request.method == "GET":
        return render(request, 'cadastro.html')
 
    usuario = request.POST.get('usuario', '').strip()
    email = request.POST.get('email', '').strip()
    senha = request.POST.get('senha', '')
    confirma_senha = request.POST.get('confirma_senha', '')
 
    if senha != confirma_senha:
        messages.error(request, 'As senhas não coincidem.')
        return render(request, 'cadastro.html')
 
    if User.objects.filter(username=usuario).exists():
        messages.error(request, 'Já existe um usuário com esse nome. Tente novamente.')
        return render(request, 'cadastro.html')
 
    if User.objects.filter(email=email).exists():
        messages.error(request, 'Esse e-mail já está cadastrado.')
        return render(request, 'cadastro.html')
 
    User.objects.create_user(username=usuario, email=email, password=senha)
    messages.success(request, 'Cadastro realizado! Faça login.')
    return redirect('login')
 
 
def logout(request):
    logout_django(request)
    return redirect('login')


@login_required
def editar_perfil(request):
    user = request.user
 
    if request.method == 'GET':
        return render(request, 'editar_perfil.html', {'user': user})
 
    # Campos simples de texto/número
    user.nome = request.POST.get('nome', '').strip()
    user.bio = request.POST.get('bio', '').strip()
    user.imagem_perfil_url = request.POST.get('imagem_perfil_url', '').strip()
    user.sexo = request.POST.get('sexo', '') or None
    user.is_privado = request.POST.get('is_privado') == 'on'
 
    # Campos opcionais que podem vir vazios
    data_nasc = request.POST.get('data_nascimento', '').strip()
    user.data_nascimento = data_nasc if data_nasc else None
 
    peso = request.POST.get('peso_atual', '').strip()
    user.peso_atual = float(peso) if peso else None
 
    altura = request.POST.get('altura_cm', '').strip()
    user.altura_cm = float(altura) if altura else None
 
    user.save()
    messages.success(request, 'Perfil atualizado com sucesso!')
    return redirect('editar_perfil')