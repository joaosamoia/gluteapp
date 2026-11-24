/**
 * GLÚTEO 21 — Conteúdo completo do programa.
 * Tudo que é texto/estrutura do desafio mora aqui.
 */

export type Level = "iniciante" | "intermediaria";
export type Equipment = "nada" | "band" | "peso";
export type ExerciseType = "reps" | "tempo";
export type Pose =
  | "bridge"
  | "quadruped"
  | "side"
  | "squat"
  | "lunge"
  | "stand"
  | "plank"
  | "seated"
  | "jump"
  | "step";

export interface Variation {
  nome: string;
  /** dica extra específica da variação */
  dica?: string;
}

export interface Exercise {
  id: string;
  nome: string;
  tipo: ExerciseType;
  /** Variação por equipamento. "nada" é sempre a base (peso do corpo). */
  variacoes: { nada: Variation } & Partial<Record<Exclude<Equipment, "nada">, Variation>>;
  dicas: string[];
  erroComum: string;
  /** id de outro exercício da biblioteca OU texto livre */
  alternativaMaisFacil: string;
  mediaUrl: string;
  musculo: string;
  pose: Pose;
}

export const MEDIA_PLACEHOLDER = "placeholder";

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  nada: "Nada (peso do corpo)",
  band: "Mini band (elástico)",
  peso: "Garrafa ou halter",
};

export const LEVEL_LABEL: Record<Level, string> = {
  iniciante: "Iniciante",
  intermediaria: "Intermediária",
};

// ---------------------------------------------------------------------------
// Biblioteca de exercícios
// ---------------------------------------------------------------------------

const ex = (e: Omit<Exercise, "mediaUrl"> & { mediaUrl?: string }): Exercise => ({
  mediaUrl: MEDIA_PLACEHOLDER,
  ...e,
});

export const EXERCISES: Record<string, Exercise> = Object.fromEntries(
  [
    // ---------- Aquecimento ----------
    ex({
      id: "polichinelo-leve",
      nome: "Polichinelo leve",
      tipo: "tempo",
      musculo: "Aquecimento",
      pose: "jump",
      variacoes: { nada: { nome: "Polichinelo leve" } },
      dicas: ["Pode fazer sem pular: abre uma perna de cada vez", "Respira solto, é só pra esquentar"],
      erroComum: "Sair com tudo e cansar antes do treino começar.",
      alternativaMaisFacil: "Marcha no lugar elevando os joelhos.",
    }),
    ex({
      id: "circulos-quadril",
      nome: "Círculos de quadril",
      tipo: "tempo",
      musculo: "Aquecimento",
      pose: "stand",
      variacoes: { nada: { nome: "Círculos de quadril" } },
      dicas: ["Mãos na cintura, desenha um círculo grande com o quadril", "Troca o sentido na metade do tempo"],
      erroComum: "Mexer só os ombros e deixar o quadril parado.",
      alternativaMaisFacil: "Balançar o quadril de um lado pro outro.",
    }),
    ex({
      id: "ponte-lenta",
      nome: "Ponte lenta",
      tipo: "tempo",
      musculo: "Aquecimento",
      pose: "bridge",
      variacoes: { nada: { nome: "Ponte lenta" } },
      dicas: ["Sobe devagar, 3 segundos pra subir e 3 pra descer", "Sente o bumbum acordando"],
      erroComum: "Subir rápido demais e usar a lombar.",
      alternativaMaisFacil: "Só apertar o bumbum deitada, sem tirar o quadril do chão.",
    }),
    ex({
      id: "agachamento-sem-peso",
      nome: "Agachamento sem peso",
      tipo: "tempo",
      musculo: "Aquecimento",
      pose: "squat",
      variacoes: { nada: { nome: "Agachamento sem peso" } },
      dicas: ["Desce só até onde for confortável", "Ritmo tranquilo, sem pressa"],
      erroComum: "Tirar o calcanhar do chão.",
      alternativaMaisFacil: "Sentar e levantar da cadeira.",
    }),

    // ---------- Padrão ponte / extensão de quadril ----------
    ex({
      id: "elevacao-pelvica",
      nome: "Elevação pélvica",
      tipo: "reps",
      musculo: "Glúteo máximo",
      pose: "bridge",
      variacoes: {
        nada: { nome: "Elevação pélvica" },
        band: { nome: "Elevação pélvica com mini band", dica: "Elástico acima do joelho, empurra os joelhos pra fora" },
      },
      dicas: [
        "Pés firmes no chão, na largura do quadril",
        "Empurra o chão com o calcanhar",
        "Aperta o bumbum lá em cima por 1 segundo",
      ],
      erroComum: "Arquear a lombar no topo em vez de apertar o glúteo.",
      alternativaMaisFacil: "isometria-ponte",
    }),
    ex({
      id: "hip-thrust-sofa",
      nome: "Hip thrust no sofá",
      tipo: "reps",
      musculo: "Glúteo máximo",
      pose: "bridge",
      variacoes: {
        nada: { nome: "Hip thrust no sofá" },
        band: { nome: "Hip thrust no sofá com mini band", dica: "Mantém os joelhos abertos contra o elástico" },
        peso: { nome: "Hip thrust no sofá com peso", dica: "Garrafa ou halter apoiado no quadril, segura com as mãos" },
      },
      dicas: [
        "Costas apoiadas na beirada do sofá, logo abaixo da escápula",
        "Queixo pra dentro, olhando pra frente",
        "Lá em cima a canela fica reta, na vertical",
      ],
      erroComum: "Jogar a cabeça pra trás e sentir tudo na lombar.",
      alternativaMaisFacil: "elevacao-pelvica",
    }),
    ex({
      id: "ponte-unilateral",
      nome: "Ponte unilateral",
      tipo: "reps",
      musculo: "Glúteo máximo",
      pose: "bridge",
      variacoes: {
        nada: { nome: "Ponte unilateral" },
        band: { nome: "Ponte unilateral com mini band" },
      },
      dicas: [
        "Uma perna esticada pro alto, a outra empurra o chão",
        "Quadril sobe reto, sem tombar pro lado",
        "Aperta o bumbum da perna de apoio",
      ],
      erroComum: "Deixar o quadril cair pro lado da perna solta.",
      alternativaMaisFacil: "elevacao-pelvica",
    }),
    ex({
      id: "ponte-unilateral-sofa",
      nome: "Ponte unilateral no sofá",
      tipo: "reps",
      musculo: "Glúteo máximo",
      pose: "bridge",
      variacoes: {
        nada: { nome: "Ponte unilateral no sofá" },
        band: { nome: "Ponte unilateral no sofá com mini band" },
      },
      dicas: [
        "Costas no sofá, um pé no chão e a outra perna dobrada no ar",
        "Sobe empurrando pelo calcanhar",
        "Desce controlando, sem despencar",
      ],
      erroComum: "Empurrar com a ponta do pé e sentir só a coxa.",
      alternativaMaisFacil: "ponte-unilateral",
    }),
    ex({
      id: "ponte-marcha",
      nome: "Ponte com marcha",
      tipo: "reps",
      musculo: "Glúteo + core",
      pose: "bridge",
      variacoes: {
        nada: { nome: "Ponte com marcha" },
        band: { nome: "Ponte com marcha e mini band" },
      },
      dicas: [
        "Sobe na ponte e fica lá em cima",
        "Tira um pé do chão de cada vez, como se marchasse",
        "Quadril parado, não deixa balançar",
      ],
      erroComum: "Deixar o quadril cair toda vez que tira o pé.",
      alternativaMaisFacil: "isometria-ponte",
    }),
    ex({
      id: "isometria-ponte",
      nome: "Isometria de ponte",
      tipo: "tempo",
      musculo: "Glúteo máximo",
      pose: "bridge",
      variacoes: {
        nada: { nome: "Isometria de ponte" },
        band: { nome: "Isometria de ponte com mini band" },
      },
      dicas: ["Sobe e segura lá em cima", "Aperta o bumbum o tempo todo", "Respira, não prende o ar"],
      erroComum: "Ir descendo aos pouquinhos sem perceber.",
      alternativaMaisFacil: "Segurar 15s, descansar 5s e repetir.",
    }),
    ex({
      id: "frog-pump",
      nome: "Frog pump",
      tipo: "reps",
      musculo: "Glúteo máximo",
      pose: "bridge",
      variacoes: { nada: { nome: "Frog pump" } },
      dicas: [
        "Sola dos pés juntas, joelhos abertos como uma borboleta",
        "Sobe e desce rapidinho, curto e forte",
        "Aperta o bumbum a cada subida",
      ],
      erroComum: "Subir alto demais e arquear as costas.",
      alternativaMaisFacil: "elevacao-pelvica",
    }),

    // ---------- Glúteo médio / abdução ----------
    ex({
      id: "clamshell",
      nome: "Clamshell (concha)",
      tipo: "reps",
      musculo: "Glúteo médio",
      pose: "side",
      variacoes: {
        nada: { nome: "Clamshell" },
        band: { nome: "Clamshell com mini band", dica: "Elástico logo acima dos joelhos" },
      },
      dicas: [
        "Deitada de lado, joelhos dobrados e pés juntos",
        "Abre o joelho de cima sem separar os pés",
        "Quadril não gira pra trás",
      ],
      erroComum: "Girar o tronco pra trás pra abrir mais.",
      alternativaMaisFacil: "Fazer a mesma abertura com amplitude menor.",
    }),
    ex({
      id: "caminhada-lateral",
      nome: "Caminhada lateral",
      tipo: "reps",
      musculo: "Glúteo médio",
      pose: "squat",
      variacoes: {
        nada: { nome: "Caminhada lateral semi-agachada" },
        band: { nome: "Caminhada lateral com mini band", dica: "Elástico acima do joelho ou no tornozelo" },
      },
      dicas: [
        "Joelho levemente dobrado, bumbum pra trás",
        "Passo médio, sem bater os pés",
        "Joelho na direção do pé, nunca pra dentro",
      ],
      erroComum: "Ficar em pé reto e arrastar o pé.",
      alternativaMaisFacil: "Passos laterais em pé, sem agachar.",
    }),
    ex({
      id: "caminhada-lateral-agachada",
      nome: "Caminhada lateral agachada",
      tipo: "reps",
      musculo: "Glúteo médio",
      pose: "squat",
      variacoes: {
        nada: { nome: "Caminhada lateral agachada" },
        band: { nome: "Caminhada lateral agachada com mini band" },
      },
      dicas: ["Desce mais que na caminhada normal e fica lá", "Tronco firme, sem balançar", "Sente queimar do lado do bumbum"],
      erroComum: "Subir o quadril a cada passo.",
      alternativaMaisFacil: "caminhada-lateral",
    }),
    ex({
      id: "abducao-deitada",
      nome: "Abdução lateral deitada",
      tipo: "reps",
      musculo: "Glúteo médio",
      pose: "side",
      variacoes: {
        nada: { nome: "Abdução lateral deitada" },
        band: { nome: "Abdução lateral deitada com mini band" },
      },
      dicas: [
        "Deitada de lado, perna de cima esticada",
        "Sobe a perna com o calcanhar levemente pra trás",
        "Dedão do pé aponta pra frente, não pro teto",
      ],
      erroComum: "Levar a perna pra frente e trabalhar a coxa em vez do glúteo.",
      alternativaMaisFacil: "clamshell",
    }),
    ex({
      id: "fire-hydrant",
      nome: "Fire hydrant",
      tipo: "reps",
      musculo: "Glúteo médio",
      pose: "quadruped",
      variacoes: {
        nada: { nome: "Fire hydrant" },
        band: { nome: "Fire hydrant com mini band" },
      },
      dicas: [
        "Em 4 apoios: mãos embaixo do ombro, joelhos embaixo do quadril",
        "Abre o joelho pro lado, dobrado em 90°",
        "Tronco parado, só a perna mexe",
      ],
      erroComum: "Tombar o corpo todo pro lado contrário.",
      alternativaMaisFacil: "clamshell",
    }),
    ex({
      id: "fire-hydrant-extensao",
      nome: "Fire hydrant com extensão",
      tipo: "reps",
      musculo: "Glúteo médio + máximo",
      pose: "quadruped",
      variacoes: {
        nada: { nome: "Fire hydrant com extensão" },
        band: { nome: "Fire hydrant com extensão e mini band" },
      },
      dicas: ["Abre o joelho pro lado", "Estica a perna pra trás", "Volta e repete — devagar e com controle"],
      erroComum: "Arquear a lombar ao esticar a perna.",
      alternativaMaisFacil: "fire-hydrant",
    }),

    // ---------- Coices ----------
    ex({
      id: "coice-4-apoios",
      nome: "Coice em 4 apoios",
      tipo: "reps",
      musculo: "Glúteo máximo",
      pose: "quadruped",
      variacoes: {
        nada: { nome: "Coice em 4 apoios" },
        band: { nome: "Coice em 4 apoios com mini band" },
      },
      dicas: [
        "Joelho dobrado, empurra a sola do pé pro teto",
        "Aperta o bumbum lá em cima",
        "Barriga firme, costas retinhas",
      ],
      erroComum: "Subir a perna alto demais e arquear a lombar.",
      alternativaMaisFacil: "Mesmo movimento com amplitude menor, só até a linha do quadril.",
    }),
    ex({
      id: "coice-em-pe",
      nome: "Coice em pé",
      tipo: "reps",
      musculo: "Glúteo máximo",
      pose: "stand",
      variacoes: {
        nada: { nome: "Coice em pé" },
        band: { nome: "Coice em pé com mini band", dica: "Elástico no tornozelo" },
      },
      dicas: ["Segura numa cadeira ou parede", "Leva a perna esticada pra trás", "Tronco levemente inclinado pra frente"],
      erroComum: "Jogar o tronco pra frente pra ganhar amplitude.",
      alternativaMaisFacil: "coice-4-apoios",
    }),

    // ---------- Agachamentos ----------
    ex({
      id: "agachamento-livre",
      nome: "Agachamento livre",
      tipo: "reps",
      musculo: "Pernas + glúteo",
      pose: "squat",
      variacoes: {
        nada: { nome: "Agachamento livre" },
        band: { nome: "Agachamento com mini band", dica: "Empurra os joelhos pra fora contra o elástico" },
      },
      dicas: [
        "Pés na largura do ombro, pontas levemente pra fora",
        "Senta pra trás como se tivesse uma cadeira",
        "Joelho na direção do pé",
      ],
      erroComum: "Deixar o joelho entrar pra dentro na subida.",
      alternativaMaisFacil: "Sentar e levantar da cadeira.",
    }),
    ex({
      id: "agachamento-sumo",
      nome: "Agachamento sumô",
      tipo: "reps",
      musculo: "Glúteo + interno de coxa",
      pose: "squat",
      variacoes: {
        nada: { nome: "Agachamento sumô" },
        band: { nome: "Agachamento sumô com mini band" },
        peso: { nome: "Agachamento sumô com peso", dica: "Segura a garrafa/halter no meio, braços esticados" },
      },
      dicas: ["Pés bem afastados, pontas pra fora", "Desce reto, tronco em pé", "Aperta o bumbum pra subir"],
      erroComum: "Inclinar o tronco pra frente.",
      alternativaMaisFacil: "agachamento-livre",
    }),
    ex({
      id: "agachamento-pausa",
      nome: "Agachamento com pausa",
      tipo: "reps",
      musculo: "Pernas + glúteo",
      pose: "squat",
      variacoes: {
        nada: { nome: "Agachamento com pausa" },
        band: { nome: "Agachamento com pausa e mini band" },
      },
      dicas: ["Desce e segura 2 segundos lá embaixo", "Não relaxa na pausa, fica firme", "Sobe com força"],
      erroComum: "Fazer a pausa no meio do caminho, sem descer de verdade.",
      alternativaMaisFacil: "agachamento-livre",
    }),
    ex({
      id: "agachamento-1e-meio",
      nome: "Agachamento sumô 1 e ½",
      tipo: "reps",
      musculo: "Glúteo + interno de coxa",
      pose: "squat",
      variacoes: {
        nada: { nome: "Agachamento sumô 1 e ½" },
        band: { nome: "Agachamento sumô 1 e ½ com mini band" },
        peso: { nome: "Agachamento sumô 1 e ½ com peso" },
      },
      dicas: ["Desce tudo, sobe até a metade", "Desce de novo e aí sobe inteiro", "Isso conta como 1 repetição"],
      erroComum: "Encurtar o meio movimento e virar um agachamento normal.",
      alternativaMaisFacil: "agachamento-sumo",
    }),
    ex({
      id: "agachamento-salto",
      nome: "Agachamento com salto",
      tipo: "reps",
      musculo: "Pernas + glúteo",
      pose: "jump",
      variacoes: { nada: { nome: "Agachamento com salto" } },
      dicas: ["Agacha e explode pra cima", "Aterrissa macio, joelho dobrado", "Se tiver vizinho embaixo, faz a versão com pausa 😉"],
      erroComum: "Cair com a perna esticada.",
      alternativaMaisFacil: "agachamento-pausa",
    }),
    ex({
      id: "agachamento-parede",
      nome: "Agachamento na parede (isometria)",
      tipo: "tempo",
      musculo: "Pernas + glúteo",
      pose: "squat",
      variacoes: { nada: { nome: "Agachamento na parede" } },
      dicas: ["Costas coladas na parede", "Joelho em 90°, em cima do tornozelo", "Empurra o chão com o calcanhar"],
      erroComum: "Apoiar as mãos nas coxas.",
      alternativaMaisFacil: "Mesmo exercício, mas descendo só até a metade.",
    }),

    // ---------- Unilaterais ----------
    ex({
      id: "afundo-reverso",
      nome: "Afundo reverso",
      tipo: "reps",
      musculo: "Glúteo + coxa",
      pose: "lunge",
      variacoes: { nada: { nome: "Afundo reverso" } },
      dicas: ["Dá um passo grande pra trás", "Desce o joelho de trás em direção ao chão", "Volta empurrando com o pé da frente"],
      erroComum: "Passo curto demais, joelho da frente passa muito do pé.",
      alternativaMaisFacil: "Afundo parado (sem dar o passo), segurando numa cadeira.",
    }),
    ex({
      id: "afundo-lateral",
      nome: "Afundo lateral",
      tipo: "reps",
      musculo: "Glúteo + interno de coxa",
      pose: "lunge",
      variacoes: { nada: { nome: "Afundo lateral" } },
      dicas: ["Passo largo pro lado", "Senta no quadril da perna que dobrou", "A outra perna fica esticada"],
      erroComum: "Deixar o joelho passar da ponta do pé e o calcanhar sair do chão.",
      alternativaMaisFacil: "Mesmo movimento com menos amplitude.",
    }),
    ex({
      id: "bulgaro-cadeira",
      nome: "Búlgaro na cadeira",
      tipo: "reps",
      musculo: "Glúteo + coxa",
      pose: "lunge",
      variacoes: {
        nada: { nome: "Búlgaro na cadeira" },
        peso: { nome: "Búlgaro na cadeira com peso", dica: "Uma garrafa/halter em cada mão" },
      },
      dicas: [
        "Peito do pé de trás apoiado na cadeira",
        "Tronco levemente inclinado pra frente = mais glúteo",
        "Desce reto, como um elevador",
      ],
      erroComum: "Pé da frente muito perto da cadeira.",
      alternativaMaisFacil: "afundo-reverso",
    }),
    ex({
      id: "step-up-cadeira",
      nome: "Step-up na cadeira",
      tipo: "reps",
      musculo: "Glúteo + coxa",
      pose: "step",
      variacoes: { nada: { nome: "Step-up na cadeira" } },
      dicas: [
        "Use uma cadeira firme, encostada na parede",
        "Sobe empurrando pelo calcanhar do pé de cima",
        "Desce devagar, sem pular",
      ],
      erroComum: "Dar impulso com o pé de baixo.",
      alternativaMaisFacil: "Step-up num degrau de escada.",
    }),
    ex({
      id: "stiff-unilateral",
      nome: "Stiff unilateral",
      tipo: "reps",
      musculo: "Glúteo + posterior",
      pose: "stand",
      variacoes: {
        nada: { nome: "Stiff unilateral" },
        peso: { nome: "Stiff unilateral com garrafa", dica: "Peso na mão do lado contrário da perna de apoio" },
      },
      dicas: [
        "Joelho de apoio levemente dobrado",
        "Leva o quadril pra trás e o tronco desce junto",
        "Sobe apertando o bumbum",
      ],
      erroComum: "Arredondar as costas pra descer mais.",
      alternativaMaisFacil: "Stiff com as duas pernas no chão.",
    }),

    // ---------- Core ----------
    ex({
      id: "prancha",
      nome: "Prancha",
      tipo: "tempo",
      musculo: "Core",
      pose: "plank",
      variacoes: { nada: { nome: "Prancha" } },
      dicas: ["Cotovelos embaixo dos ombros", "Aperta barriga e bumbum", "Corpo reto da cabeça ao calcanhar"],
      erroComum: "Deixar o quadril cair e sentir na lombar.",
      alternativaMaisFacil: "Prancha com os joelhos no chão.",
    }),

    // ---------- Mobilidade ----------
    ex({
      id: "postura-90-90",
      nome: "Postura 90/90",
      tipo: "tempo",
      musculo: "Mobilidade de quadril",
      pose: "seated",
      variacoes: { nada: { nome: "Postura 90/90" } },
      dicas: ["Sentada, as duas pernas dobradas em 90°", "Tronco reto, inclina um pouquinho pra frente", "Respira fundo e solta o quadril"],
      erroComum: "Forçar a ponto de doer.",
      alternativaMaisFacil: "Fazer com as mãos apoiadas atrás do corpo.",
    }),
    ex({
      id: "alongamento-flexor",
      nome: "Alongamento do flexor de quadril",
      tipo: "tempo",
      musculo: "Mobilidade de quadril",
      pose: "lunge",
      variacoes: { nada: { nome: "Alongamento do flexor de quadril" } },
      dicas: ["Um joelho no chão (coloca uma toalha embaixo)", "Aperta o bumbum da perna de trás", "Leva o quadril levemente pra frente"],
      erroComum: "Arquear a lombar em vez de encaixar o quadril.",
      alternativaMaisFacil: "Fazer em pé, com passo à frente.",
    }),
    ex({
      id: "gato-camelo",
      nome: "Gato-camelo",
      tipo: "tempo",
      musculo: "Mobilidade de coluna",
      pose: "quadruped",
      variacoes: { nada: { nome: "Gato-camelo" } },
      dicas: ["Em 4 apoios, arredonda as costas pro teto", "Depois afunda a barriga e olha pra frente", "Acompanha com a respiração"],
      erroComum: "Fazer rápido demais.",
      alternativaMaisFacil: "Mesmo movimento sentada numa cadeira.",
    }),
    ex({
      id: "borboleta",
      nome: "Borboleta",
      tipo: "tempo",
      musculo: "Mobilidade de quadril",
      pose: "seated",
      variacoes: { nada: { nome: "Borboleta" } },
      dicas: ["Sola dos pés juntas", "Segura os pés e deixa os joelhos caírem", "Coluna alta"],
      erroComum: "Empurrar os joelhos com força.",
      alternativaMaisFacil: "Sentar com as costas apoiadas na parede.",
    }),
    ex({
      id: "pombo-adaptado",
      nome: "Pombo adaptado",
      tipo: "tempo",
      musculo: "Mobilidade de glúteo",
      pose: "seated",
      variacoes: { nada: { nome: "Pombo adaptado" } },
      dicas: ["Deitada de barriga pra cima, cruza o tornozelo no joelho oposto", "Puxa a coxa de baixo em direção ao peito", "Sente alongar o bumbum"],
      erroComum: "Tirar a cabeça do chão e tensionar o pescoço.",
      alternativaMaisFacil: "Fazer sentada numa cadeira, tornozelo no joelho.",
    }),
    ex({
      id: "respiracao",
      nome: "Respiração",
      tipo: "tempo",
      musculo: "Relaxamento",
      pose: "seated",
      variacoes: { nada: { nome: "Respiração profunda" } },
      dicas: ["Puxa o ar pelo nariz em 4 segundos", "Solta pela boca em 6 segundos", "Você mandou bem hoje 💜"],
      erroComum: "Respirar só pelo peito.",
      alternativaMaisFacil: "Respirar no seu ritmo, de olhos fechados.",
    }),
  ].map((e) => [e.id, e]),
);

// ---------------------------------------------------------------------------
// Estrutura dos treinos
// ---------------------------------------------------------------------------

export interface WorkoutItem {
  exerciseId: string;
  series: number;
  reps?: number;
  seconds?: number;
  porLado?: boolean;
  unidade?: "reps" | "passos" | "pulsos";
  nota?: string;
  finalizador?: boolean;
  aquecimento?: boolean;
}

export type PhaseId = 1 | 2 | 3;
export type WorkoutKind = "A" | "B" | "C" | "descanso" | "teste";

export interface Phase {
  id: PhaseId;
  nome: string;
  subtitulo: string;
  minutos: number;
  dias: number[];
  cor: string;
}

export const PHASES: Phase[] = [
  { id: 1, nome: "Ativação", subtitulo: "Aprender o movimento e sentir o glúteo", minutos: 20, dias: [1, 2, 3, 4, 5, 6, 7], cor: "#B9A4F5" },
  { id: 2, nome: "Construção", subtitulo: "Mais volume, unilateral e descida de 3s", minutos: 25, dias: [8, 9, 10, 11, 12, 13, 14], cor: "#8E6CEF" },
  { id: 3, nome: "Pico", subtitulo: "Isometria, perto da falha e finalizador", minutos: 30, dias: [15, 16, 17, 18, 19, 20, 21], cor: "#6A45D9" },
];

export const WORKOUT_INFO: Record<WorkoutKind, { titulo: string; foco: string; emoji: string }> = {
  A: { titulo: "Treino A", foco: "Glúteo máximo · ponte e extensão", emoji: "🍑" },
  B: { titulo: "Treino B", foco: "Glúteo médio · lateral e abdução", emoji: "🦋" },
  C: { titulo: "Treino C", foco: "Completo · pernas + glúteo", emoji: "🔥" },
  descanso: { titulo: "Descanso ativo", foco: "Mobilidade · 10 min", emoji: "🧘‍♀️" },
  teste: { titulo: "Teste final", foco: "Repete o Dia 1 pra comparar", emoji: "🏆" },
};

export const WARMUP: WorkoutItem[] = [
  { exerciseId: "polichinelo-leve", series: 1, seconds: 45, aquecimento: true },
  { exerciseId: "circulos-quadril", series: 1, seconds: 45, aquecimento: true },
  { exerciseId: "ponte-lenta", series: 1, seconds: 45, aquecimento: true },
  { exerciseId: "agachamento-sem-peso", series: 1, seconds: 45, aquecimento: true },
];

const r = (exerciseId: string, series: number, reps: number, extra: Partial<WorkoutItem> = {}): WorkoutItem => ({
  exerciseId,
  series,
  reps,
  ...extra,
});
const t = (exerciseId: string, series: number, seconds: number, extra: Partial<WorkoutItem> = {}): WorkoutItem => ({
  exerciseId,
  series,
  seconds,
  ...extra,
});
const L = { porLado: true } as const;

export const WORKOUTS: Record<PhaseId, Record<"A" | "B" | "C", WorkoutItem[]>> = {
  1: {
    A: [
      r("clamshell", 2, 15, L),
      r("elevacao-pelvica", 3, 15),
      r("ponte-unilateral", 3, 10, L),
      r("coice-4-apoios", 3, 12, L),
      r("frog-pump", 2, 20),
    ],
    B: [
      r("caminhada-lateral", 3, 12, { ...L, unidade: "passos" }),
      r("abducao-deitada", 3, 15, L),
      r("fire-hydrant", 3, 12, L),
      r("agachamento-sumo", 3, 15),
      t("isometria-ponte", 2, 30),
    ],
    C: [
      r("agachamento-livre", 3, 15),
      r("afundo-reverso", 3, 10, L),
      r("step-up-cadeira", 3, 10, L),
      r("elevacao-pelvica", 3, 15),
      t("prancha", 2, 30),
    ],
  },
  2: {
    A: [
      r("hip-thrust-sofa", 4, 12, { nota: "Descida de 3 segundos" }),
      r("ponte-unilateral-sofa", 3, 10, L),
      r("stiff-unilateral", 3, 10, L),
      r("coice-em-pe", 3, 15, L),
      r("frog-pump", 2, 25),
    ],
    B: [
      r("caminhada-lateral-agachada", 4, 12, { ...L, unidade: "passos" }),
      r("abducao-deitada", 3, 15, { ...L, nota: "Pausa de 2s lá em cima" }),
      r("fire-hydrant-extensao", 3, 12, L),
      r("agachamento-sumo", 3, 15, { nota: "Pausa de 2s lá embaixo" }),
      r("clamshell", 2, 20, L),
    ],
    C: [
      r("bulgaro-cadeira", 3, 10, L),
      r("agachamento-pausa", 3, 12, { nota: "Pausa de 2s lá embaixo" }),
      r("afundo-lateral", 3, 10, L),
      r("hip-thrust-sofa", 3, 15),
      r("ponte-marcha", 2, 20),
    ],
  },
  3: {
    A: [
      r("hip-thrust-sofa", 4, 15, { nota: "Na última série: segura 20s de isometria no topo" }),
      r("ponte-unilateral-sofa", 4, 12, L),
      r("stiff-unilateral", 3, 12, L),
      r("coice-4-apoios", 3, 15, { ...L, nota: "Pausa de 1s lá em cima" }),
      r("frog-pump", 1, 100, { finalizador: true, nota: "No tempo que precisar — pode parar e voltar" }),
    ],
    B: [
      r("caminhada-lateral", 4, 15, { ...L, unidade: "passos" }),
      r("abducao-deitada", 3, 20, { ...L, nota: "+ 20 pulsos curtinhos no final" }),
      r("fire-hydrant", 3, 15, L),
      r("agachamento-1e-meio", 3, 12),
      t("agachamento-parede", 3, 40, { finalizador: true }),
    ],
    C: [
      r("bulgaro-cadeira", 4, 12, L),
      r("agachamento-salto", 3, 12, { nota: "Sem impacto? Troca pelo agachamento com pausa" }),
      r("step-up-cadeira", 3, 12, L),
      r("hip-thrust-sofa", 3, 20),
      t("ponte-marcha", 1, 60, { finalizador: true }),
    ],
  },
};

export const ACTIVE_REST: WorkoutItem[] = [
  t("postura-90-90", 1, 60, L),
  t("alongamento-flexor", 1, 60, L),
  t("gato-camelo", 1, 60),
  t("borboleta", 1, 60),
  t("pombo-adaptado", 1, 60, L),
  t("respiracao", 1, 60),
];

// ---------------------------------------------------------------------------
// Calendário dos 21 dias
// ---------------------------------------------------------------------------

export interface DayPlan {
  day: number;
  phase: PhaseId;
  kind: WorkoutKind;
  /** +2 reps (dias 5, 6, 7 de cada fase) */
  plus2: boolean;
  minutos: number;
}

const WEEK_PATTERN: { kind: WorkoutKind; plus2: boolean }[] = [
  { kind: "A", plus2: false },
  { kind: "B", plus2: false },
  { kind: "C", plus2: false },
  { kind: "descanso", plus2: false },
  { kind: "A", plus2: true },
  { kind: "B", plus2: true },
  { kind: "C", plus2: true },
];

export const DAYS: DayPlan[] = Array.from({ length: 21 }, (_, i) => {
  const day = i + 1;
  const phase = (Math.floor(i / 7) + 1) as PhaseId;
  const pattern = day === 21 ? { kind: "teste" as const, plus2: false } : WEEK_PATTERN[i % 7];
  const minutos = pattern.kind === "descanso" ? 10 : day === 21 ? 20 : PHASES[phase - 1].minutos;
  return { day, phase, kind: pattern.kind, plus2: pattern.plus2, minutos };
});

export const TOTAL_DAYS = 21;

// ---------------------------------------------------------------------------
// Montagem do treino com nível + equipamento
// ---------------------------------------------------------------------------

export interface ResolvedItem extends WorkoutItem {
  exercise: Exercise;
  nomeExibido: string;
  dicaVariacao?: string;
}

export function applyLevel(item: WorkoutItem, level: Level, plus2: boolean): WorkoutItem {
  if (item.aquecimento) return item;
  let { series, reps } = item;
  if (reps !== undefined && plus2 && !item.finalizador) reps += 2;
  if (level === "iniciante") {
    if (series > 2) series = Math.max(2, series - 1);
    if (reps !== undefined && !item.finalizador) reps = Math.round(reps * 0.8);
    if (reps !== undefined && item.finalizador) reps = Math.round(reps * 0.8);
  }
  return { ...item, series, reps };
}

export function resolveVariation(exercise: Exercise, equipment: Equipment): Variation {
  return exercise.variacoes[equipment] ?? exercise.variacoes.nada;
}

export function getWorkout(day: number, level: Level, equipment: Equipment): {
  plan: DayPlan;
  warmup: ResolvedItem[];
  items: ResolvedItem[];
  equipamentoNecessario: string[];
} {
  const plan = DAYS[day - 1];
  let base: WorkoutItem[];
  if (plan.kind === "descanso") base = ACTIVE_REST;
  else if (plan.kind === "teste") base = WORKOUTS[1].A;
  else base = WORKOUTS[plan.phase][plan.kind];

  const resolve = (it: WorkoutItem): ResolvedItem => {
    const exercise = EXERCISES[it.exerciseId];
    const v = resolveVariation(exercise, equipment);
    return { ...it, exercise, nomeExibido: v.nome, dicaVariacao: v.dica };
  };

  const items = base.map((it) => resolve(applyLevel(it, level, plan.plus2)));
  const warmup = plan.kind === "descanso" ? [] : WARMUP.map(resolve);

  const eq = new Set<string>(["Tapetinho ou toalha"]);
  for (const it of items) {
    if (["hip-thrust-sofa", "ponte-unilateral-sofa"].includes(it.exerciseId)) eq.add("Sofá");
    if (["bulgaro-cadeira", "step-up-cadeira", "coice-em-pe"].includes(it.exerciseId)) eq.add("Cadeira firme");
    if (it.exerciseId === "agachamento-parede") eq.add("Parede livre");
    if (equipment !== "nada" && it.exercise.variacoes[equipment]) eq.add(EQUIPMENT_LABEL[equipment]);
  }
  return { plan, warmup, items, equipamentoNecessario: [...eq] };
}

export function formatPrescription(it: WorkoutItem): string {
  const lado = it.porLado ? "/lado" : "";
  if (it.seconds !== undefined) return it.series > 1 ? `${it.series} × ${it.seconds}s${lado}` : `${it.seconds}s${lado}`;
  const un = it.unidade === "passos" ? " passos" : "";
  return it.series > 1 ? `${it.series} × ${it.reps}${un}${lado}` : `${it.reps}${un}${lado}`;
}

export function dayTitle(day: number): string {
  const p = DAYS[day - 1];
  return WORKOUT_INFO[p.kind].titulo;
}
