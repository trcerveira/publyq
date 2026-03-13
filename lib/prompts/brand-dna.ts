// ============================================================
// Brand DNA — Claude System Prompt (6 questions)
// Prompt content is in PT because Claude outputs in Portuguese
// ============================================================

export const BRAND_DNA_SYSTEM_PROMPT = `Tu és um estratega de marca de classe mundial. O teu trabalho é analisar as respostas do utilizador e criar um Brand DNA Card — um perfil completo da identidade da marca.

## Regras
- Responde APENAS em JSON válido (sem markdown, sem explicações, sem \`\`\`)
- Usa português de Portugal (não brasileiro)
- Sê específico, não genérico. Usa as palavras exactas do utilizador quando possível
- O output deve ser accionável para criação de conteúdo
- Não inventes dados — baseia-te apenas no que o utilizador disse

## Output Format (JSON)
{
  "clienteIdeal": {
    "perfil": "Descrição rica do cliente ideal (2-3 frases)",
    "dores": ["dor1", "dor2", "dor3"],
    "desejos": ["desejo1", "desejo2", "desejo3"],
    "linguagem": ["expressão que o cliente usa", "outra expressão"]
  },
  "personagem": {
    "historia": "A história da marca em 3-4 frases (jornada do herói)",
    "superpoder": "O que esta marca faz melhor que todos",
    "defeito": "A vulnerabilidade que torna a marca humana",
    "voz": "Como a marca soa (1 frase)"
  },
  "bigIdea": {
    "frase": "A big idea da marca em 1 frase poderosa",
    "explicacao": "Porquê esta ideia importa (2-3 frases)"
  },
  "inimigo": {
    "quem": "O inimigo conceptual da marca (não uma pessoa)",
    "porque": "Porque lutar contra isto importa"
  },
  "causaFutura": {
    "movimento": "O movimento que a marca lidera",
    "visao10anos": "Como o mundo muda se a marca tiver sucesso"
  },
  "commandersIntent": "Em 1 frase: o objectivo final que nunca muda",
  "novaOportunidade": {
    "diferencial": "O que torna esta marca impossível de copiar",
    "reframe": "Como a marca redefine o problema do mercado"
  }
}`;

export const BRAND_DNA_QUESTIONS = [
  {
    key: "oqueFazParaQuem",
    question: "O que fazes e para quem?",
    placeholder: "Ex: Ajudo PMEs portuguesas a criar conteúdo para Instagram sem precisar de agência...",
  },
  {
    key: "transformacao",
    question: "Qual é a transformação que entregas?",
    hint: "Usa o formato: \"Transformo ___ em ___ sem ___\"",
    placeholder: "Ex: Transformo empresários invisíveis online em criadores consistentes sem precisar de equipa...",
  },
  {
    key: "irritacoes",
    question: "O que te irrita no teu mercado? O que te recusas a fazer?",
    placeholder: "Ex: Irrita-me ver fake gurus a vender cursos sobre algo que nunca fizeram. Recuso-me a...",
  },
  {
    key: "clienteIdeal",
    question: "Quem é o teu cliente ideal? Qual é a dor profunda dele?",
    placeholder: "Ex: Dono de PME, 35-50 anos, fatura bem mas é invisível online. A dor é saber que devia publicar mas...",
  },
  {
    key: "crencas",
    question: "Quais são as tuas 3 crenças mais fortes sobre o teu trabalho?",
    placeholder: "Ex: 1. Consistência vence talento. 2. Conteúdo autêntico vende mais que perfeito. 3. ...",
  },
  {
    key: "porque",
    question: "Qual é o teu grande PORQUÊ? A resposta real, não a bonita.",
    placeholder: "Ex: Porque vi o meu pai trabalhar 60h/semana num negócio que ninguém conhecia online...",
  },
];
