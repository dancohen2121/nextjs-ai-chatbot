import Airtable from 'airtable';

// Initialize Airtable base (assuming base configuration is in a separate airtable.ts file)
import { base } from '../airtable';

export type User = {
  id: string;
  email: string;
  password: string;
};

export type Chat = {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
};

// Function to delete a chat by ID
export const deleteChatById = async (chatId: string): Promise<void> => {
  try {
    await base('Chats').destroy([chatId]);
    console.log(`Chat with ID ${chatId} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

// Function to get a chat by ID
export const getChatById = async (chatId: string): Promise<Chat | null> => {
  try {
    const record = await base('Chats').find(chatId);
    return {
      id: record.id,
      userId: record.fields.userId as string,
      message: record.fields.message as string,
      createdAt: record.fields.createdAt as string,
    };
  } catch (error) {
    console.error('Error fetching chat by ID:', error);
    return null;
  }
};

// Function to save a new chat
export const saveChat = async (chatData: Partial<Chat>): Promise<Chat> => {
  try {
    const record = await base('Chats').create({
      userId: chatData.userId,
      message: chatData.message,
      createdAt: new Date().toISOString(),
    });
    return {
      id: record.id,
      userId: record.fields.userId as string,
      message: record.fields.message as string,
      createdAt: record.fields.createdAt as string,
    };
  } catch (error) {
    console.error('Error saving chat:', error);
    throw error;
  }
};

// Function to fetch a user by ID
export async function getUser(userId: string): Promise<User | null> {
  try {
    const records = await base('Users')
      .select({
        filterByFormula: `{id} = '${userId}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length > 0) {
      const fields = records[0].fields;
      return {
        id: records[0].id,
        email: fields.email as string,
        password: fields.password as string,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}