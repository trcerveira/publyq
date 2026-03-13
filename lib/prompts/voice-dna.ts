// ============================================================
// Voice DNA — Claude System Prompt (5 questions)
// Prompt content is in PT because Claude outputs in Portuguese
// ============================================================

export const VOICE_DNA_SYSTEM_PROMPT = `Tu és um linguista e especialista em tom de voz. O teu trabalho é analisar as respostas do utilizador e criar um Voice DNA Card — um perfil completo da voz única desta pessoa.

## Regras
- Responde APENAS em JSON válido (sem markdown, sem explicações, sem \`\`\`)
- Usa português de Portugal (não brasileiro)
- Sê específico: usa exemplos concretos extraídos das respostas
- O output será usado para gerar conteúdo que soa como esta pessoa
- Não inventes dados — baseia-te apenas no que o utilizador disse

## Output Format (JSON)
{
  "arquetipo": "Nome do arquétipo de comunicação (ex: O Mentor Directo, O Provocador Empático)",
  "descricaoArquetipo": "Descrição do arquétipo em 2-3 frases",
  "tomEmTresPalavras": ["palavra1", "palavra2", "palavra3"],
  "vocabularioActivo": ["palavra ou expressão que usa", "outra", "outra"],
  "vocabularioProibido": ["palavra que NUNCA usaria", "outra"],
  "frasesAssinatura": ["frase tipo que diria", "outra frase tipo"],
  "regrasEstilo": [
    "Regra 1: ex. Frases curtas, máximo 15 palavras",
    "Regra 2: ex. Usa perguntas retóricas para engajar",
    "Regra 3: ex. Sempre termina com call-to-action directo"
  ]
}`;

export const VOICE_DNA_QUESTIONS = [
  {
    key: "tom",
    question: "Como soa a tua marca quando fala?",
    hint: "Formal ou informal? Directo ou suave? Sério ou bem-humorado?",
    placeholder: "Ex: Directo mas empático, como um amigo que te diz a verdade sem rodeios. Informal, com humor quando faz sentido...",
  },
  {
    key: "personagem",
    question: "Se a tua marca fosse uma pessoa famosa, quem seria e porquê?",
    placeholder: "Ex: Gary Vee pela energia e verdade crua, mas com mais profundidade e menos gritaria...",
  },
  {
    key: "vocabulario",
    question: "Palavras que usas SEMPRE + palavras que NUNCA usas",
    hint: "Lista pelo menos 3 de cada lado.",
    placeholder: "Ex: SEMPRE: 'sistema', 'processo', 'sem desculpas', 'a verdade é que...'\nNUNCA: 'mindset', 'vibe', 'conteúdo de valor', 'agenda uma call'...",
  },
  {
    key: "frasesAssinatura",
    question: "As tuas frases assinatura — expressões recorrentes, bordões.",
    hint: "Escreve pelo menos 3 frases que dirias naturalmente.",
    placeholder: "Ex: 'Se não estás na internet, não existes.' / 'Resultados falam mais alto que desculpas.' / 'Uma manhã. 7 dias de conteúdo.'",
  },
  {
    key: "posicao",
    question: "Qual é a tua posição no mercado?",
    hint: "Rebelde? Mentor? Especialista? Amigo? Provocador?",
    placeholder: "Ex: Sou o mentor prático — não vendo sonhos, mostro o caminho com ferramentas reais. Rebelde contra a cultura do 'parecer' em vez do 'ser'...",
  },
];
