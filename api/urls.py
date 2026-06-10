from django.urls import path
from . import views

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────
    path('csrf/', views.csrf, name='api-csrf'),
    path('auth/login/', views.login_api, name='api-login'),
    path('auth/logout/', views.logout_api, name='api-logout'),

    # ── Core ──────────────────────────────────────────────────
    path('me/', views.me, name='api-me'),
    path('feed/', views.feed, name='api-feed'),
    path('stories/', views.stories, name='api-stories'),
    path('workout/templates/', views.workout_templates, name='api-workout-templates'),
    path('exercicios/', views.exercicios, name='api-exercicios'),
    path('notifications/', views.notifications, name='api-notifications'),
    path('notifications/mark-all-read/', views.mark_all_notifications_read, name='api-notifications-read'),
    path('profile/', views.profile, name='api-profile'),
    path('posts/<int:post_id>/like/', views.toggle_like, name='api-post-like'),
    path('posts/<int:post_id>/comentarios/', views.post_comentarios, name='api-post-comentarios'),
]
