"""
API views — JSON endpoints for the React frontend.
All endpoints require Django session authentication.

Field names match exactly what the frontend expects.
"""
import json
from datetime import datetime

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods, require_GET, require_POST

from social.models import ComentarioPost, CurtidaPost, Post, PostImagem
from treinos.models import (
    Exercicio,
    RecordePessoal,
    SessaoTreino,
    TreinoExercicioTemplate,
    TreinoTemplate,
)
from usuarios.models import Conquista, Notificacao, UsuarioConquista, UsuarioSeguimento

User = get_user_model()


# ── Auth decorator ─────────────────────────────────────────────────────────────

def require_auth(fn):
    """Returns 401 JSON if user is not authenticated."""
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'detail': 'Not authenticated'}, status=401)
        return fn(request, *args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper


# ── Auth endpoints ─────────────────────────────────────────────────────────────

@ensure_csrf_cookie
@require_GET
def csrf(request):
    """GET /api/csrf/ — set the csrftoken cookie and return it."""
    return JsonResponse({'csrfToken': get_token(request)})


@csrf_exempt
@require_POST
def login_api(request):
    """POST /api/auth/login/ — JSON body: { username, password }."""
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, AttributeError):
        return JsonResponse({'detail': 'Invalid JSON'}, status=400)

    username = body.get('username', '').strip()
    password = body.get('password', '')

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({'detail': 'Usuário ou senha incorretos.'}, status=401)

    auth_login(request, user)
    return JsonResponse(user_to_dict(user))


@require_POST
@require_auth
def logout_api(request):
    """POST /api/auth/logout/"""
    auth_logout(request)
    return JsonResponse({'status': 'logged out'})



# ── Serializers ────────────────────────────────────────────────────────────────

def user_to_dict(user):
    return {
        'id': user.id,
        'username': user.username,
        'nome': user.nome or user.username,
        'imagem_perfil_url': user.imagem_perfil_url or None,
        'streak_atual': user.streak_atual,
        'maior_streak': user.maior_streak,
        'bio': user.bio or '',
        'peso_atual': float(user.peso_atual) if user.peso_atual else None,
        'altura_cm': float(user.altura_cm) if user.altura_cm else None,
        'is_privado': user.is_privado,
    }


def post_to_dict(post, current_user=None):
    imagens = [img.imagem_url for img in post.imagens.all()]
    curtidas_count = post.curtidas.count()
    comentarios_count = post.comentarios.count()
    liked_by_me = False
    if current_user and current_user.is_authenticated:
        liked_by_me = post.curtidas.filter(usuario=current_user).exists()

    sessao_stats = None
    if post.sessao_treino_id:
        try:
            sessao = post.sessao_treino
            num_exercicios = sessao.exercicios.count()

            duracao_min = None
            if sessao.finalizado_em and sessao.iniciado_em:
                diff_secs = (sessao.finalizado_em - sessao.iniciado_em).total_seconds()
                duracao_min = int(diff_secs / 60)
                # Sanity check: negative or > 600 min is bad data
                if duracao_min < 0 or duracao_min > 600:
                    duracao_min = None

            volume = float(sessao.volume_total_kg) if sessao.volume_total_kg else None
            # Sanity check: negative volume is bad data
            if volume is not None and volume < 0:
                volume = None

            sessao_stats = {
                'num_exercicios': num_exercicios,
                'duracao_min': duracao_min,
                'volume_total_kg': volume,
            }
        except Exception:
            sessao_stats = None

    return {
        'id': post.id,
        'titulo': post.titulo,
        'conteudo': post.conteudo,
        'data_post': post.data_post.isoformat(),
        'usuario': user_to_dict(post.usuario),
        'imagens': imagens,
        'total_curtidas': curtidas_count,
        'total_comentarios': comentarios_count,
        'liked_by_me': liked_by_me,
        'sessao_treino_id': post.sessao_treino_id,
        'sessao_stats': sessao_stats,
    }


def template_to_dict(template):
    exercicios_template = template.exercicios.select_related('exercicio').prefetch_related(
        'exercicio__musculos'
    ).order_by('ordem')

    musculos_set = []
    seen = set()
    num_exercicios = exercicios_template.count()
    total_series = sum((ex.series_sugeridas or 3) for ex in exercicios_template)
    duracao_est = total_series * 2 + (num_exercicios * 2)

    for et in exercicios_template:
        for m in et.exercicio.musculos.all():
            if m.nome not in seen:
                musculos_set.append(m.nome)
                seen.add(m.nome)
            if len(musculos_set) >= 3:
                break
        if len(musculos_set) >= 3:
            break

    return {
        'id': template.id,
        'nome': template.nome,
        'descricao': template.descricao or '',
        'is_publico': template.is_publico,
        'criado_em': template.criado_em.isoformat(),
        'usuario': user_to_dict(template.usuario),
        'num_exercicios': num_exercicios,
        'duracao_estimada_min': duracao_est,
        'musculos': musculos_set,
    }


def notification_to_dict(notif):
    origem = notif.usuario_origem
    return {
        'id': notif.id,
        'tipo': notif.tipo,
        'mensagem': notif.mensagem,
        'is_lida': notif.is_lida,
        'criado_em': notif.criado_em.isoformat(),
        'usuario_origem': user_to_dict(origem) if origem else None,
    }


def comentario_to_dict(comentario):
    return {
        'id': comentario.id,
        'mensagem': comentario.mensagem,
        'criado_em': comentario.criado_em.isoformat(),
        'usuario': user_to_dict(comentario.usuario),
    }


# ── Endpoints ──────────────────────────────────────────────────────────────────

@require_GET
@require_auth
def me(request):
    """GET /api/me/ — current user info."""
    user = request.user
    followers = UsuarioSeguimento.objects.filter(seguido=user, is_ativo=True).count()
    following = UsuarioSeguimento.objects.filter(seguidor=user, is_ativo=True).count()
    workouts = SessaoTreino.objects.filter(
        usuario=user, finalizado_em__isnull=False
    ).count()

    data = user_to_dict(user)
    data.update({
        'is_staff': user.is_staff,
        'followers': followers,
        'following': following,
        'workouts': workouts,
    })
    return JsonResponse(data)


@require_GET
@require_auth
def feed(request):
    """
    GET /api/feed/?cursor=<iso_datetime>
    Returns 10 posts before the cursor (newest first).
    """
    PAGE_SIZE = 10
    cursor_str = request.GET.get('cursor')

    qs = Post.objects.select_related('usuario', 'sessao_treino').prefetch_related(
        'imagens', 'curtidas', 'comentarios'
    ).order_by('-data_post')

    if cursor_str:
        try:
            cursor_dt = datetime.fromisoformat(cursor_str)
            qs = qs.filter(data_post__lt=cursor_dt)
        except ValueError:
            pass

    posts = list(qs[:PAGE_SIZE])
    has_more = len(posts) == PAGE_SIZE
    results = [post_to_dict(p, request.user) for p in posts]
    next_cursor = posts[-1].data_post.isoformat() if posts else None

    return JsonResponse({
        'results': results,
        'next_cursor': next_cursor,
        'has_more': has_more,
    })


@require_GET
@require_auth
def stories(request):
    """GET /api/stories/ — users the current user follows (StoriesRow)."""
    seguindo_ids = UsuarioSeguimento.objects.filter(
        seguidor=request.user, is_ativo=True
    ).values_list('seguido_id', flat=True)

    users = User.objects.filter(id__in=seguindo_ids)[:20]
    return JsonResponse({
        'results': [user_to_dict(u) for u in users],
        'me': user_to_dict(request.user),
    })


@require_auth
@require_http_methods(["GET", "POST"])
def workout_templates(request):
    """
    GET  /api/workout/templates/ — own + community templates
    POST /api/workout/templates/ — create new template
    """
    if request.method == 'GET':
        my_templates = TreinoTemplate.objects.filter(
            usuario=request.user
        ).prefetch_related('exercicios__exercicio__musculos').order_by('-criado_em')

        community_templates = TreinoTemplate.objects.filter(
            is_publico=True
        ).exclude(
            usuario=request.user
        ).prefetch_related(
            'exercicios__exercicio__musculos'
        ).select_related('usuario').order_by('-criado_em')[:20]

        return JsonResponse({
            'my_templates': [template_to_dict(t) for t in my_templates],
            'community_templates': [template_to_dict(t) for t in community_templates],
        })

    # POST — create template
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, AttributeError):
        return JsonResponse({'detail': 'Invalid JSON'}, status=400)

    nome = body.get('nome', '').strip()
    if not nome:
        return JsonResponse({'detail': 'Nome é obrigatório'}, status=400)

    template = TreinoTemplate.objects.create(
        usuario=request.user,
        nome=nome,
        descricao=body.get('descricao', ''),
        is_publico=body.get('is_publico', False),
    )

    for i, ex_data in enumerate(body.get('exercicios', [])):
        ex_id = ex_data.get('exercicio_id')
        if not ex_id:
            continue
        try:
            exercicio = Exercicio.objects.get(id=ex_id)
            TreinoExercicioTemplate.objects.create(
                treino_template=template,
                exercicio=exercicio,
                ordem=ex_data.get('ordem', i + 1),
                series_sugeridas=ex_data.get('series_sugeridas'),
                descanso_segundos=ex_data.get('descanso_segundos'),
            )
        except Exercicio.DoesNotExist:
            pass

    return JsonResponse(template_to_dict(template), status=201)


@require_GET
@require_auth
def exercicios(request):
    """GET /api/exercicios/ — list all exercises for template builder."""
    qs = Exercicio.objects.prefetch_related('musculos').order_by('nome')
    results = [{
        'id': ex.id,
        'nome': ex.nome,
        'musculos': [m.nome for m in ex.musculos.all()],
    } for ex in qs]
    return JsonResponse({'results': results})


@require_GET
@require_auth
def notifications(request):
    """GET /api/notifications/ — unread first, then read."""
    all_notifs = list(
        Notificacao.objects.filter(
            usuario_destino=request.user
        ).select_related('usuario_origem').order_by('-criado_em')
    )

    unread = [n for n in all_notifs if not n.is_lida]
    read = [n for n in all_notifs if n.is_lida]

    return JsonResponse({
        'unread_count': len(unread),
        'today': [notification_to_dict(n) for n in unread],
        'earlier': [notification_to_dict(n) for n in read],
    })


@csrf_exempt
@require_POST
@require_auth
def mark_all_notifications_read(request):
    """POST /api/notifications/mark-all-read/"""
    Notificacao.objects.filter(
        usuario_destino=request.user, is_lida=False
    ).update(is_lida=True)
    return JsonResponse({'status': 'ok'})


@require_GET
@require_auth
def profile(request):
    """GET /api/profile/ — full profile for current user."""
    user = request.user
    followers = UsuarioSeguimento.objects.filter(seguido=user, is_ativo=True).count()
    following = UsuarioSeguimento.objects.filter(seguidor=user, is_ativo=True).count()
    workouts = SessaoTreino.objects.filter(
        usuario=user, finalizado_em__isnull=False
    ).count()

    # Sum volume only from finished sessions with valid positive values
    total_volume = 0.0
    for s in SessaoTreino.objects.filter(
        usuario=user, finalizado_em__isnull=False
    ).only('volume_total_kg'):
        v = float(s.volume_total_kg or 0)
        if v > 0:
            total_volume += v

    # Personal Records
    prs = RecordePessoal.objects.filter(
        usuario=user
    ).select_related('exercicio').order_by('-data_conquista')
    pr_list = [{
        'id': pr.id,
        'exercicio_nome': pr.exercicio.nome,
        'maior_peso_kg': float(pr.maior_peso_kg) if pr.maior_peso_kg else None,
        'valor_1rm_estimado': float(pr.valor_1rm_estimado) if pr.valor_1rm_estimado else None,
        'data_conquista': pr.data_conquista.isoformat(),
    } for pr in prs]

    # Achievements
    conquistas = UsuarioConquista.objects.filter(usuario=user).select_related('conquista')
    achievement_list = [{
        'id': uc.conquista.id,
        'nome': uc.conquista.nome,
        'descricao': uc.conquista.descricao,
        'xp_recompensa': uc.conquista.xp_recompensa,
        'conquistado_em': uc.conquistado_em.isoformat(),
    } for uc in conquistas]

    data = user_to_dict(user)
    data.update({
        'followers': followers,
        'following': following,
        'workouts': workouts,
        'total_volume_kg': round(total_volume, 2),
        'personal_records': pr_list,
        'achievements': achievement_list,
    })
    return JsonResponse(data)


@csrf_exempt
@require_POST
@require_auth
def toggle_like(request, post_id):
    """POST /api/posts/<id>/like/ — toggle like. Returns { liked, count }."""
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({'detail': 'Post not found'}, status=404)

    curtida, created = CurtidaPost.objects.get_or_create(
        post=post, usuario=request.user
    )
    if not created:
        curtida.delete()
        liked = False
    else:
        liked = True

    return JsonResponse({
        'liked': liked,
        'count': post.curtidas.count(),
    })


@require_auth
@require_http_methods(["GET", "POST"])
def post_comentarios(request, post_id):
    """
    GET  /api/posts/<id>/comentarios/ — list comments
    POST /api/posts/<id>/comentarios/ — create comment (body: { mensagem })
    """
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({'detail': 'Post not found'}, status=404)

    if request.method == 'GET':
        comentarios = ComentarioPost.objects.filter(
            post=post
        ).select_related('usuario').order_by('criado_em')
        return JsonResponse({
            'results': [comentario_to_dict(c) for c in comentarios],
            'count': comentarios.count(),
        })

    # POST — create comment
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, AttributeError):
        return JsonResponse({'detail': 'Invalid JSON'}, status=400)

    mensagem = body.get('mensagem', '').strip()
    if not mensagem:
        return JsonResponse({'detail': 'Mensagem é obrigatória'}, status=400)

    comentario = ComentarioPost.objects.create(
        post=post,
        usuario=request.user,
        mensagem=mensagem,
    )
    return JsonResponse(comentario_to_dict(comentario), status=201)
