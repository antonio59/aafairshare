import { supabase } from '../core/api/supabase';
import { User } from '@supabase/supabase-js';

// Get API key from environment
const apiKey = import.meta.env.VITE_API_KEY;

interface Expense {
  title: string;
  amount: number;
  category: string;
  date: string;
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Helper function to get user data
async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Function to get AI assistant response
export async function getAIAssistance(userMessage: string): Promise<string> {
  const user = await getCurrentUser();
  
  if (!user) throw new Error('User not authenticated');

  try {
    const response = await fetch('https://api-hub-579483274893.us-central1.run.app/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        inputs: {
          messages: [
            {
              role: "system",
              content: "You are a helpful financial assistant for the aafairshare expense tracking app. " +
                "Provide concise, friendly advice on managing shared expenses, settling debts, and " +
                "understanding financial analytics. Keep responses under 100 words and focus on practical tips. " +
                "Use British English as the app's default currency is GBP."
            },
            {
              role: "user",
              content: userMessage
            }
          ]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: AIResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI assistance:', error);
    return 'Sorry, I couldn\'t process your request at the moment. Please try again later.';
  }
}

// Function to analyze expense patterns
export async function analyzeExpensePatterns(expenses: Expense[]): Promise<string> {
  try {
    const expenseDataFormatted = expenses.map(expense => ({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date
    }));

    const response = await fetch('https://api-hub-579483274893.us-central1.run.app/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        inputs: {
          messages: [
            {
              role: "system",
              content: "You are a financial analysis expert. Analyze the provided expense data and give " +
                "insights on spending patterns, categories with the highest expenses, and " +
                "potential areas for saving money. Be concise and insightful. Use bullet points."
            },
            {
              role: "user",
              content: `Please analyze these expenses: ${JSON.stringify(expenseDataFormatted)}`
            }
          ]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: AIResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing expense patterns:', error);
    return 'Unable to analyze expenses at this time.';
  }
} 