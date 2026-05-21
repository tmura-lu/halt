
# Como rodar:
#   python manage.py seed_data            # cria os dados
#   python manage.py seed_data --limpar   # apaga tudo antes de recriar

import random
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

# ── Models ────────────────────────────────────────────────────────────────────
from treinos.models import (
    Exercicio,
    ExercicioMusculo,
    Musculo,
    RecordePessoal,
    Serie,
    SessaoExercicio,
    SessaoTreino,
    TipoSerieChoices,
    TreinoExercicioTemplate,
    TreinoTemplate,
)
from social.models import ComentarioPost, CurtidaPost, Post, PostImagem
from usuarios.models import (
    Conquista,
    Notificacao,
    TipoNotificacaoChoices,
    UsuarioConquista,
    UsuarioSeguimento,
)

Usuario = get_user_model()


# ── Dados fixos de referência ─────────────────────────────────────────────────

MUSCULOS = [
    "Peitoral", "Costas", "Bíceps", "Tríceps", "Ombro",
    "Quadríceps", "Isquiotibiais", "Glúteo", "Panturrilha", "Abdômen",
]

EXERCICIOS = [
    {"nome": "Supino Reto",         "categoria": "Força",    "equipamento": "Barra",      "musculos": ["Peitoral", "Tríceps", "Ombro"]},
    {"nome": "Agachamento Livre",   "categoria": "Força",    "equipamento": "Barra",      "musculos": ["Quadríceps", "Glúteo", "Isquiotibiais"]},
    {"nome": "Levantamento Terra",  "categoria": "Força",    "equipamento": "Barra",      "musculos": ["Costas", "Glúteo", "Isquiotibiais"]},
    {"nome": "Remada Curvada",      "categoria": "Força",    "equipamento": "Barra",      "musculos": ["Costas", "Bíceps"]},
    {"nome": "Desenvolvimento",     "categoria": "Força",    "equipamento": "Halteres",   "musculos": ["Ombro", "Tríceps"]},
    {"nome": "Rosca Direta",        "categoria": "Isolado",  "equipamento": "Halteres",   "musculos": ["Bíceps"]},
    {"nome": "Tríceps Pulley",      "categoria": "Isolado",  "equipamento": "Cabo",       "musculos": ["Tríceps"]},
    {"nome": "Leg Press",           "categoria": "Força",    "equipamento": "Máquina",    "musculos": ["Quadríceps", "Glúteo"]},
    {"nome": "Pulldown",            "categoria": "Força",    "equipamento": "Cabo",       "musculos": ["Costas", "Bíceps"]},
    {"nome": "Plank",               "categoria": "Core",     "equipamento": "Nenhum",     "musculos": ["Abdômen"]},
]

CONQUISTAS = [
    {"nome": "Primeira Sessão",     "descricao": "Completou o primeiro treino.",         "xp": 50},
    {"nome": "Semana Perfeita",     "descricao": "Treinou 7 dias seguidos.",              "xp": 200},
    {"nome": "Centurião",           "descricao": "Completou 100 sessões de treino.",      "xp": 1000},
    {"nome": "Levantador de Peso",  "descricao": "Acumulou 10.000 kg de volume total.",   "xp": 500},
    {"nome": "Social Butterfly",    "descricao": "Recebeu 50 curtidas em posts.",         "xp": 150},
]

USUARIOS_SEED = [
    {"username": "carlos_fit",   "nome": "Carlos Eduardo",  "email": "carlos@email.com",  "staff": False},
    {"username": "ana_treinos",  "nome": "Ana Beatriz",     "email": "ana@email.com",     "staff": False},
    {"username": "rafa_strong",  "nome": "Rafael Lima",     "email": "rafa@email.com",    "staff": False},
    {"username": "admin",        "nome": "Administrador",   "email": "admin@email.com",   "staff": True},
]


# ── Command ───────────────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = "Popula o banco com dados de teste para usuarios, treinos e social."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limpar",
            action="store_true",
            help="Apaga todos os dados existentes antes de recriar.",
        )

    def handle(self, *args, **options):
        if options["limpar"]:
            self._limpar_banco()

        self.stdout.write("\n🌱 Iniciando seed de dados...\n")

        musculos      = self._criar_musculos()
        exercicios    = self._criar_exercicios(musculos)
        conquistas    = self._criar_conquistas()
        usuarios      = self._criar_usuarios()
        templates     = self._criar_treino_templates(usuarios, exercicios)
        sessoes       = self._criar_sessoes(usuarios, templates, exercicios)
        self._criar_seguimentos(usuarios)
        self._criar_conquistas_usuarios(usuarios, conquistas)
        posts         = self._criar_posts(usuarios, sessoes)
        self._criar_curtidas_comentarios(usuarios, posts)
        self._criar_notificacoes(usuarios)
        self._criar_recordes(usuarios, exercicios)

        self.stdout.write(self.style.SUCCESS("\n✅ Seed concluído com sucesso!\n"))

    # ── Limpeza ───────────────────────────────────────────────────────────────

    def _limpar_banco(self):
        self.stdout.write(self.style.WARNING("🗑️  Limpando banco de dados..."))
        models_para_limpar = [
            ComentarioPost, CurtidaPost, PostImagem, Post,
            RecordePessoal, Serie, SessaoExercicio, SessaoTreino,
            TreinoExercicioTemplate, TreinoTemplate,
            UsuarioConquista, UsuarioSeguimento, Notificacao,
            Conquista, ExercicioMusculo, Exercicio, Musculo,
            Usuario,
        ]
        for model in models_para_limpar:
            count, _ = model.objects.all().delete()
            if count:
                self.stdout.write(f"   Removidos {count} registros de {model.__name__}")

    # ── Criadores ─────────────────────────────────────────────────────────────

    def _criar_musculos(self):
        self.stdout.write("💪 Criando músculos...")
        musculos = {}
        for nome in MUSCULOS:
            obj, criado = Musculo.objects.get_or_create(nome=nome)
            musculos[nome] = obj
        self.stdout.write(f"   {len(musculos)} músculos prontos.")
        return musculos

    def _criar_exercicios(self, musculos):
        self.stdout.write("🏋️  Criando exercícios...")
        exercicios = []
        for dados in EXERCICIOS:
            ex, _ = Exercicio.objects.get_or_create(
                nome=dados["nome"],
                defaults={
                    "categoria":  dados["categoria"],
                    "equipamento": dados["equipamento"],
                    "descricao":  f"Exercício de {dados['categoria'].lower()} para {dados['musculos'][0].lower()}.",
                },
            )
            # Vincula músculos (primeiro = principal)
            for i, nome_musculo in enumerate(dados["musculos"]):
                ExercicioMusculo.objects.get_or_create(
                    exercicio=ex,
                    musculo=musculos[nome_musculo],
                    defaults={"is_principal": i == 0},
                )
            exercicios.append(ex)
        self.stdout.write(f"   {len(exercicios)} exercícios prontos.")
        return exercicios

    def _criar_conquistas(self):
        self.stdout.write("🏆 Criando conquistas...")
        conquistas = []
        for dados in CONQUISTAS:
            obj, _ = Conquista.objects.get_or_create(
                nome=dados["nome"],
                defaults={"descricao": dados["descricao"], "xp_recompensa": dados["xp"]},
            )
            conquistas.append(obj)
        self.stdout.write(f"   {len(conquistas)} conquistas prontas.")
        return conquistas

    def _criar_usuarios(self):
        self.stdout.write("👤 Criando usuários...")
        usuarios = []
        for dados in USUARIOS_SEED:
            usuario, criado = Usuario.objects.get_or_create(
                username=dados["username"],
                defaults={
                    "email":          dados["email"],
                    "nome":           dados["nome"],
                    "is_staff":       dados["staff"],
                    "is_superuser":   dados["staff"],
                    "streak_atual":   random.randint(0, 30),
                    "maior_streak":   random.randint(30, 90),
                    "peso_atual":     round(random.uniform(60, 100), 2),
                    "altura_cm":      round(random.uniform(160, 195), 2),
                    "bio":            f"Apaixonado(a) por treinos. 💪",
                },
            )
            if criado:
                usuario.set_password("senha123")
                usuario.save()
            usuarios.append(usuario)
        self.stdout.write(f"   {len(usuarios)} usuários prontos.")
        self.stdout.write(self.style.WARNING("   Senha de todos: senha123"))
        return usuarios

    def _criar_treino_templates(self, usuarios, exercicios):
        self.stdout.write("📋 Criando templates de treino...")
        nomes_templates = [
            ("Treino A - Peito e Tríceps",  [0, 6]),
            ("Treino B - Costas e Bíceps",  [3, 5, 8]),
            ("Treino C - Pernas",            [1, 7]),
            ("Full Body",                    [0, 1, 2, 4]),
        ]
        templates = []
        for usuario in usuarios[:3]:  # 3 primeiros usuários criam templates
            for nome, indices_ex in nomes_templates:
                template, _ = TreinoTemplate.objects.get_or_create(
                    usuario=usuario,
                    nome=nome,
                    defaults={"is_publico": random.choice([True, False])},
                )
                # Adiciona exercícios ao template
                for ordem, idx in enumerate(indices_ex, start=1):
                    TreinoExercicioTemplate.objects.get_or_create(
                        treino_template=template,
                        exercicio=exercicios[idx],
                        defaults={
                            "ordem":            ordem,
                            "series_sugeridas": random.randint(3, 5),
                            "descanso_segundos": random.choice([60, 90, 120]),
                        },
                    )
                templates.append(template)
        self.stdout.write(f"   {len(templates)} templates prontos.")
        return templates

    def _criar_sessoes(self, usuarios, templates, exercicios):
        self.stdout.write("🏃 Criando sessões de treino...")
        sessoes = []
        for usuario in usuarios[:3]:
            templates_do_usuario = [t for t in templates if t.usuario == usuario]
            for i in range(4):  # 4 sessões por usuário
                iniciado = timezone.now() - timedelta(days=random.randint(1, 60))
                finalizado = iniciado + timedelta(minutes=random.randint(40, 90))
                template = random.choice(templates_do_usuario) if templates_do_usuario else None

                sessao = SessaoTreino.objects.create(
                    usuario=usuario,
                    treino_template=template,
                    finalizado_em=finalizado,
                    observacao=random.choice([
                        "Treino pesado hoje, superei meu PR!",
                        "Cansado, mas finalizei.",
                        "Excelente sessão.",
                        None,
                    ]),
                )

                # Cria exercícios e séries na sessão
                volume_total = 0
                exercicios_sessao = random.sample(exercicios, k=random.randint(3, 5))
                for ordem, exercicio in enumerate(exercicios_sessao, start=1):
                    sessao_ex = SessaoExercicio.objects.create(
                        sessao_treino=sessao,
                        exercicio=exercicio,
                        ordem=ordem,
                    )
                    for num_serie in range(1, random.randint(3, 5)):
                        peso = round(random.uniform(20, 100), 2)
                        reps = random.randint(6, 15)
                        serie = Serie.objects.create(
                            sessao_exercicio=sessao_ex,
                            numero_serie=num_serie,
                            peso_kg=peso,
                            repeticoes=reps,
                            tipo_serie=random.choice([
                                TipoSerieChoices.NORMAL,
                                TipoSerieChoices.AQUECIMENTO,
                            ]),
                        )
                        volume_total += float(serie.volume_serie or 0)

                # Atualiza volume total da sessão
                sessao.volume_total_kg = round(volume_total, 2)
                sessao.save()
                sessoes.append(sessao)

        self.stdout.write(f"   {len(sessoes)} sessões prontas.")
        return sessoes

    def _criar_seguimentos(self, usuarios):
        self.stdout.write("🤝 Criando seguimentos...")
        count = 0
        # Cada usuário segue os outros (exceto a si mesmo)
        for seguidor in usuarios:
            for seguido in usuarios:
                if seguidor != seguido:
                    _, criado = UsuarioSeguimento.objects.get_or_create(
                        seguidor=seguidor,
                        seguido=seguido,
                        defaults={"is_ativo": True},
                    )
                    if criado:
                        count += 1
        self.stdout.write(f"   {count} seguimentos prontos.")

    def _criar_conquistas_usuarios(self, usuarios, conquistas):
        self.stdout.write("🎖️  Atribuindo conquistas...")
        count = 0
        for usuario in usuarios[:3]:
            for conquista in random.sample(conquistas, k=random.randint(1, 3)):
                _, criado = UsuarioConquista.objects.get_or_create(
                    usuario=usuario,
                    conquista=conquista,
                )
                if criado:
                    count += 1
        self.stdout.write(f"   {count} conquistas atribuídas.")

    def _criar_posts(self, usuarios, sessoes):
        self.stdout.write("📝 Criando posts...")
        posts = []
        titulos = [
            "Treino destruidor hoje 🔥",
            "Superando limites",
            "PR batido! Muito feliz 💪",
            "Semana de volume pesado",
            "Recuperação ativa",
        ]
        for usuario in usuarios[:3]:
            sessoes_do_usuario = [s for s in sessoes if s.usuario == usuario]
            for i in range(3):
                sessao = random.choice(sessoes_do_usuario) if sessoes_do_usuario else None
                post = Post.objects.create(
                    usuario=usuario,
                    sessao_treino=sessao,
                    titulo=random.choice(titulos),
                    conteudo=(
                        "Mais um treino concluído! Foco, disciplina e consistência "
                        "são a chave para os resultados. 💪🏽"
                    ),
                    volume_total_post=sessao.volume_total_kg if sessao else None,
                )
                # Adiciona imagem de placeholder
                PostImagem.objects.create(
                    post=post,
                    imagem_url=f"https://picsum.photos/seed/{post.pk}/800/600",
                    ordem=0,
                )
                posts.append(post)
        self.stdout.write(f"   {len(posts)} posts prontos.")
        return posts

    def _criar_curtidas_comentarios(self, usuarios, posts):
        self.stdout.write("❤️  Criando curtidas e comentários...")
        curtidas = 0
        comentarios_count = 0
        mensagens = [
            "Arrasou demais! 🔥",
            "Inspiração! Continua assim.",
            "Que volume absurdo!",
            "Mandou bem! 💪",
            "Quero chegar nesse nível.",
        ]
        for post in posts:
            for usuario in usuarios:
                if usuario != post.usuario and random.random() > 0.3:
                    _, criado = CurtidaPost.objects.get_or_create(post=post, usuario=usuario)
                    if criado:
                        curtidas += 1
                if usuario != post.usuario and random.random() > 0.6:
                    ComentarioPost.objects.create(
                        post=post,
                        usuario=usuario,
                        mensagem=random.choice(mensagens),
                    )
                    comentarios_count += 1
        self.stdout.write(f"   {curtidas} curtidas e {comentarios_count} comentários prontos.")

    def _criar_notificacoes(self, usuarios):
        self.stdout.write("🔔 Criando notificações...")
        count = 0
        tipos = [
            (TipoNotificacaoChoices.CURTIDA,    "curtiu seu post."),
            (TipoNotificacaoChoices.COMENTARIO, "comentou no seu post."),
            (TipoNotificacaoChoices.SEGUIMENTO, "começou a te seguir."),
            (TipoNotificacaoChoices.CONQUISTA,  "Você desbloqueou uma nova conquista!"),
        ]
        for destino in usuarios[:3]:
            for _ in range(3):
                tipo, msg = random.choice(tipos)
                origem = random.choice([u for u in usuarios if u != destino])
                Notificacao.objects.create(
                    usuario_destino=destino,
                    usuario_origem=origem,
                    tipo=tipo,
                    mensagem=f"{origem.username} {msg}",
                    is_lida=random.choice([True, False]),
                )
                count += 1
        self.stdout.write(f"   {count} notificações prontas.")

    def _criar_recordes(self, usuarios, exercicios):
        self.stdout.write("🥇 Criando recordes pessoais...")
        count = 0
        for usuario in usuarios[:3]:
            for exercicio in random.sample(exercicios, k=4):
                peso = round(random.uniform(60, 180), 2)
                _, criado = RecordePessoal.objects.get_or_create(
                    usuario=usuario,
                    exercicio=exercicio,
                    defaults={
                        "maior_peso_kg":      peso,
                        "valor_1rm_estimado": round(peso * 1.0278, 2),
                    },
                )
                if criado:
                    count += 1
        self.stdout.write(f"   {count} recordes pessoais prontos.")