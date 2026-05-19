## 🧠 Arquitetura do Banco de Dados (Schema: Halt)

O banco de dados do **Halt** foi projetado para escalar e focar na retenção do usuário através de gamificação e análise de dados. A modelagem relacional separa estritamente o planejamento da execução, garantindo um histórico limpo e perfeito para futuras implementações de Machine Learning (como previsão de fadiga ou recomendação de cargas).

### Funcionalidades Principais:

*   **Separação Template vs. Execução:** Diferenciação arquitetônica entre o plano de treino (`treino_template`) e o que realmente aconteceu na academia (`sessao_treino`), permitindo rastreabilidade de adaptações de carga e volume em séries temporais.
*   **Motor de Gamificação e Retenção:** Controle nativo de *Streaks* (dias consecutivos de treino) e Sistema de Conquistas/XP. O banco atua como o motor de engajamento do aplicativo.
*   **Soft Delete por Padrão:** Os dados nunca são destruídos (`is_ativo BOOLEAN`). Usuários, seguidores e treinos desativados são preservados para integridade referencial e análise de métricas de *churn*.
*   **Cálculo Transacional de Esforço:** Utilização de colunas geradas (`GENERATED ALWAYS AS`) para automatizar o cálculo de volume de treino (Peso x Repetições) diretamente no banco, poupando processamento no Backend.
*   **Feed Social Integrado ao Treino:** O ecossistema social (Posts, Curtidas e Comentários) está atrelado às sessões de treino reais. Não há espaço para posts vazios; a prova social exige suor rastreável.
*   **Otimização de Performance:** Estrutura livre de binários pesados (imagens geridas via Cloud/URLs) e indexação agressiva nas tabelas de maior concorrência (Feed e Notificações).

---
1. A Lógica e o Fluxo do Usuário (O Ciclo de Vida no Halt)

Para você entender como o código se converte em ação na tela, aqui está o caminho crítico de um usuário dentro da arquitetura que montamos:

    1 - O Setup (Catálogo e Templates): O usuário entra no app. O app carrega a tabela de exercicio. Ele monta um "Treino A" na tabela treino_template e adiciona exercícios a ele (treino_exercicio_template). Até aqui, ele só planejou. O banco guarda isso como um molde estático.

    2 - O "Dar Play" (A Sessão): Quando ele chega na academia e clica em "Iniciar Treino A", o backend cria uma nova sessao_treino ligada àquele template. O relógio (iniciado_em) começa a contar.

    3 - O Grind (Séries em Tempo Real): Ele começa a fazer supino. A cada série que ele finaliza (ex: 80kg para 10 reps), o app insere uma linha na tabela serie. O banco instantaneamente calcula o volume_serie (800kg). A Trigger dispara e atualiza o volume_total_kg da sessao_treino em tempo real.

    4 - O "Dar Stop" e a Recompensa: Ele finaliza o treino. O finalizado_em é preenchido. Neste momento, o backend verifica se ele bateu algum PR (recorde_pessoal) e incrementa o streak_atual. Se ele atingiu 10 dias seguidos, o sistema insere uma linha em usuario_conquista e dispara uma notificacao de comemoração.

    5 - A Praça Pública (O Feed): A finalização do treino gera automaticamente uma linha na tabela post, atrelando o sessao_treino_id a ele. O post vai para o feed, mostrando o volume total que o banco já calculou. Os amigos (através de usuario_seguimento) veem o post, interagem via curtida_post e comentario_post, gerando novas notificações. E o ciclo recomeça amanhã.

---
### Instruções:
* Como as imagens são subidas?
Não "subimos" as imagens para o banco, nós instanciamos elas.

    Pull: O Docker baixa a imagem oficial do PostgreSQL do Docker Hub.

    Container: Ele cria um ambiente isolado (o container) baseado nessa imagem.

    Persistência: Usamos um "Volume". Isso significa que se você desligar o PC ou deletar o container, os dados do treino não somem, eles ficam guardados em uma pasta oculta no seu HD vinculada ao Docker.

E as imagens (fotos) do App?
Não salvamos fotos no banco. O banco guarda apenas o link (URL). As fotos devem ser subidas para um serviço de storage (Firebase, Cloudinary ou AWS S3) e o link resultante é o que inserimos no campo imagem_perfil_url ou imagem_url.

---
### Ideia do arquivo docker:
Acessar o Banco:

    Abram o navegador em http://localhost:5050.

    Login: admin@halt.app | Senha: admin.

    Adicionem um novo servidor com o host halt-db, usuário halt_admin e senha admin_password.

Criar o Schema: Copiem o código SQL completo que passei acima, abram a "Query Tool" no pgAdmin e executem.