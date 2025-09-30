'use server';

import { suggestTasks } from '@/ai/flows/ai-suggest-tasks';

export async function getTaskSuggestions(tasks: string[]): Promise<string[]> {
  if (tasks.length === 0) {
    return [];
  }
  
  try {
    const result = await suggestTasks({ tasks });
    return result.suggestions || [];
  } catch (error) {
    console.error('Error fetching task suggestions:', error);
    return []; 
  }
}
