import { Quest, SkillType, QuestSize } from './storage';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

// Get API key from environment variable
const getApiKey = (): string => {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key || key === 'your_groq_api_key_here') {
    throw new Error('Please set VITE_GROQ_API_KEY in .env file');
  }
  return key;
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Core AI request function
async function callGroqAPI(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
}

// Generate quest suggestions based on user context
export async function generateQuestSuggestions(context: {
  skills: { name: SkillType; level: number; xp: number }[];
  userLevel: number;
  recentQuests: Quest[];
}): Promise<Array<{ title: string; description: string; skill: SkillType; size: QuestSize }>> {
  const skillsSummary = context.skills.map(s => `${s.name} (Lv ${s.level})`).join(', ');
  const recentQuestTitles = context.recentQuests.slice(0, 5).map(q => q.title).join(', ');

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI coach for a gamification app. Generate personalized quest suggestions that are realistic, achievable, and help users improve their life skills. Focus on practical, real-world activities.`,
    },
    {
      role: 'user',
      content: `Generate 3 quest suggestions for a user with:
- Level: ${context.userLevel}
- Skills: ${skillsSummary}
- Recent quests: ${recentQuestTitles || 'None yet'}

For each quest, provide:
1. A clear, actionable title (max 50 chars)
2. A brief description (max 100 chars)
3. The most relevant skill (strength, intelligence, discipline, social, or finance)
4. Size (S for 15min, M for 30min, L for 1hr, XL for 2hr+)

Format as JSON array:
[{"title": "...", "description": "...", "skill": "...", "size": "..."}]`,
    },
  ];

  try {
    const response = await callGroqAPI(messages);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Failed to generate quest suggestions:', error);
    return [];
  }
}

// Get motivational message based on user progress
export async function getMotivationalMessage(context: {
  streakCount: number;
  level: number;
  recentCompletions: number;
  topSkill: string;
}): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an enthusiastic AI coach who provides short, motivating messages to users. Keep messages under 100 characters, positive, and action-oriented.`,
    },
    {
      role: 'user',
      content: `Generate a motivational message for a user with:
- ${context.streakCount} day streak
- Level ${context.level}
- ${context.recentCompletions} quests completed recently
- Top skill: ${context.topSkill}

Keep it brief, encouraging, and personalized.`,
    },
  ];

  try {
    const response = await callGroqAPI(messages);
    return response.trim().replace(/['"]/g, '');
  } catch (error) {
    console.error('Failed to get motivational message:', error);
    return "Keep pushing forward! You're doing great! 🚀";
  }
}

// Analyze quest and provide insights
export async function analyzeQuest(quest: {
  title: string;
  description: string;
  skill: SkillType;
}): Promise<{ difficulty: string; tips: string; estimatedTime: string }> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI assistant that analyzes tasks and provides helpful insights. Be concise and practical.`,
    },
    {
      role: 'user',
      content: `Analyze this quest:
Title: ${quest.title}
Description: ${quest.description}
Skill: ${quest.skill}

Provide:
1. Difficulty level (Easy/Medium/Hard)
2. A brief tip (max 80 chars)
3. Estimated time (e.g., "15-30 minutes")

Format as JSON: {"difficulty": "...", "tips": "...", "estimatedTime": "..."}`,
    },
  ];

  try {
    const response = await callGroqAPI(messages);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Failed to analyze quest:', error);
    return {
      difficulty: 'Medium',
      tips: 'Break it into smaller steps for better success!',
      estimatedTime: '30-60 minutes',
    };
  }
}

// Get weekly progress insights
export async function getProgressInsights(context: {
  weeklyXP: number;
  completedQuests: number;
  topSkills: Array<{ name: string; level: number }>;
  streakCount: number;
}): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI coach providing weekly progress insights. Be specific, encouraging, and offer actionable advice. Keep response under 200 characters.`,
    },
    {
      role: 'user',
      content: `Provide weekly insights for:
- ${context.weeklyXP} XP earned this week
- ${context.completedQuests} quests completed
- Top skills: ${context.topSkills.map(s => `${s.name} (Lv ${s.level})`).join(', ')}
- ${context.streakCount} day streak

Give a brief, encouraging summary with one actionable tip.`,
    },
  ];

  try {
    const response = await callGroqAPI(messages);
    return response.trim();
  } catch (error) {
    console.error('Failed to get progress insights:', error);
    return `Great progress this week! Keep maintaining your streak and focus on balanced skill development.`;
  }
}

// Chat with AI assistant
export async function chatWithAI(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a helpful AI assistant for a gamification app called LevelUp. Help users with:
- Creating and managing quests
- Setting goals
- Staying motivated
- Understanding the app features
- General productivity advice

Be friendly, concise, and action-oriented. Keep responses under 200 characters when possible.`,
    },
    ...conversationHistory,
    {
      role: 'user',
      content: userMessage,
    },
  ];

  try {
    const response = await callGroqAPI(messages);
    return response.trim();
  } catch (error) {
    console.error('Failed to chat with AI:', error);
    return "I'm having trouble connecting right now. Please try again in a moment!";
  }
}

// Check if API key is configured
export function isAIConfigured(): boolean {
  try {
    const key = import.meta.env.VITE_GROQ_API_KEY;
    return !!key && key !== 'your_groq_api_key_here';
  } catch {
    return false;
  }
}