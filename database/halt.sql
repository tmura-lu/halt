CREATE SCHEMA IF NOT EXISTS halt;
SET search_path TO halt;

-- Tipos customizados para manter a consistência dos dados
CREATE TYPE sexo_enum AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMAR');
CREATE TYPE tipo_serie_enum AS ENUM ('AQUECIMENTO', 'TRABALHO', 'FALHA', 'DROP', 'ISOMETRIA');
CREATE TYPE tipo_notificacao_enum AS ENUM ('CURTIDA', 'COMENTARIO', 'SEGUIDOR', 'RECORD', 'STREAK', 'MARCACAO');

-- Tabela de usuários: O coração do Halt
CREATE TABLE usuario (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo sexo_enum NOT NULL,
    imagem_perfil_url VARCHAR(500),
    bio VARCHAR(160),
    peso_atual NUMERIC(5,2),
    altura_cm NUMERIC(5,2),
    streak_atual INT DEFAULT 0,
    maior_streak INT DEFAULT 0,
    is_privado BOOLEAN NOT NULL DEFAULT FALSE,
    is_ativo BOOLEAN NOT NULL DEFAULT TRUE, -- Para deletar a conta sem sumir com os dados históricos
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de seguidores: Relação Muitos-para-Muitos
CREATE TABLE usuario_seguimento (
    seguidor_id BIGINT NOT NULL REFERENCES usuario(id),
    seguido_id BIGINT NOT NULL REFERENCES usuario(id),
    is_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (seguidor_id, seguido_id),
    CHECK (seguidor_id <> seguido_id)
);

-- Catálogo de exercícios e músculos (dados estáticos do sistema)
CREATE TABLE musculo (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE exercicio (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE,
    imagem_url VARCHAR(500),
    gif_url VARCHAR(500),
    descricao TEXT,
    equipamento VARCHAR(60),
    categoria VARCHAR(60),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exercicio_musculo (
    exercicio_id BIGINT NOT NULL REFERENCES exercicio(id) ON DELETE CASCADE,
    musculo_id BIGINT NOT NULL REFERENCES musculo(id) ON DELETE CASCADE,
    is_principal BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (exercicio_id, musculo_id)
);

-- Onde o usuário planeja o treino (o "molde")
CREATE TABLE treino_template (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id),
    nome VARCHAR(80) NOT NULL,
    descricao TEXT,
    is_publico BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE treino_exercicio_template (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    treino_template_id BIGINT NOT NULL REFERENCES treino_template(id) ON DELETE CASCADE,
    exercicio_id BIGINT NOT NULL REFERENCES exercicio(id) ON DELETE RESTRICT,
    ordem INT NOT NULL,
    series_sugeridas SMALLINT,
    descanso_segundos SMALLINT,
    UNIQUE (treino_template_id, ordem)
);

-- A execução real (quando o usuário clica em "Treinar Agora")
CREATE TABLE sessao_treino (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id),
    treino_template_id BIGINT REFERENCES treino_template(id) ON DELETE SET NULL,
    iniciado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finalizado_em TIMESTAMPTZ,
    volume_total_kg NUMERIC(10,2) DEFAULT 0,
    observacao TEXT,
    CHECK (finalizado_em >= iniciado_em)
);

CREATE TABLE sessao_exercicio (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sessao_treino_id BIGINT NOT NULL REFERENCES sessao_treino(id) ON DELETE CASCADE,
    exercicio_id BIGINT NOT NULL REFERENCES exercicio(id) ON DELETE RESTRICT,
    ordem INT NOT NULL,
    anotacao_performance VARCHAR(500),
    UNIQUE (sessao_treino_id, ordem)
);

-- Séries individuais dentro de cada exercício da sessão
CREATE TABLE serie (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sessao_exercicio_id BIGINT NOT NULL REFERENCES sessao_exercicio(id) ON DELETE CASCADE,
    numero_serie SMALLINT NOT NULL,
    peso_kg NUMERIC(7,2) NOT NULL,
    repeticoes SMALLINT NOT NULL,
    tipo_serie tipo_serie_enum NOT NULL DEFAULT 'TRABALHO',
    rir NUMERIC(3,1), 
    
    -- Coluna gerada: Calcula o volume da série (Peso x Reps) automaticamente
    volume_serie NUMERIC(10,2) GENERATED ALWAYS AS (peso_kg * repeticoes) STORED,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social: Feed, Curtidas, Comentários e Recordes
CREATE TABLE post (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id),
    sessao_treino_id BIGINT REFERENCES sessao_treino(id) ON DELETE SET NULL,
    titulo VARCHAR(120),
    conteudo TEXT,
    volume_total_post NUMERIC(10,2),
    data_post TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE post_imagem (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    imagem_url VARCHAR(500) NOT NULL,
    ordem INT DEFAULT 1
);

CREATE TABLE curtida_post (
    post_id BIGINT NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id),
    PRIMARY KEY (post_id, usuario_id)
);

CREATE TABLE comentario_post (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id),
    mensagem VARCHAR(500) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gamificação
CREATE TABLE conquista (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone_url VARCHAR(500),
    xp_recompensa INT DEFAULT 0
);

CREATE TABLE usuario_conquista (
    usuario_id BIGINT NOT NULL REFERENCES usuario(id),
    conquista_id BIGINT NOT NULL REFERENCES conquista(id),
    conquistado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, conquista_id)
);

CREATE TABLE notificacao (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_destino_id BIGINT NOT NULL REFERENCES usuario(id),
    usuario_origem_id BIGINT REFERENCES usuario(id),
    tipo tipo_notificacao_enum NOT NULL,
    mensagem VARCHAR(300),
    is_lida BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recorde_pessoal (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id),
    exercicio_id BIGINT NOT NULL REFERENCES exercicio(id),
    valor_1rm_estimado NUMERIC(10,2),
    maior_peso_kg NUMERIC(10,2),
    data_conquista DATE NOT NULL,
    UNIQUE (usuario_id, exercicio_id)
);

-- Índices: Garantem que o app continue rápido mesmo com milhares de posts
CREATE INDEX idx_post_data ON halt.post(data_post DESC);
CREATE INDEX idx_sessao_usuario ON halt.sessao_treino(usuario_id, iniciado_em DESC);
CREATE INDEX idx_notificacao_lida ON halt.notificacao(usuario_destino_id) WHERE is_lida = FALSE;

-- ==========================================
-- LÓGICA DE AUTOMAÇÃO (TRIGGERS)
-- ==========================================

-- Esta função recalcula o volume total da sessão sempre que uma série é criada, editada ou removida.
-- Ela é inteligente o suficiente para saber qual ID usar (OLD ou NEW) dependendo da operação.
CREATE OR REPLACE FUNCTION halt.atualizar_volume_sessao()
RETURNS TRIGGER AS $$
DECLARE
    v_sessao_treino_id BIGINT;
BEGIN
    -- Descobre qual é o ID da sessão, seja em um INSERT (NEW) ou DELETE (OLD)
    v_sessao_treino_id := COALESCE(
        (SELECT se.sessao_treino_id FROM halt.sessao_exercicio se WHERE se.id = NEW.sessao_exercicio_id),
        (SELECT se.sessao_treino_id FROM halt.sessao_exercicio se WHERE se.id = OLD.sessao_exercicio_id)
    );

    IF v_sessao_treino_id IS NOT NULL THEN
        UPDATE halt.sessao_treino
        SET volume_total_kg = COALESCE((
            SELECT SUM(s.volume_serie)
            FROM halt.serie s
            JOIN halt.sessao_exercicio se ON se.id = s.sessao_exercicio_id
            WHERE se.sessao_treino_id = v_sessao_treino_id
        ), 0)
        WHERE id = v_sessao_treino_id;
    END IF;

    -- Retorna NEW para inserts/updates e OLD para deletes
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_volume
AFTER INSERT OR UPDATE OR DELETE ON halt.serie
FOR EACH ROW EXECUTE FUNCTION halt.atualizar_volume_sessao();