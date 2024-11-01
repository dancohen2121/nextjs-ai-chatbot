import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { getUser, User } from "@/db/queries";

export type AuthUser = User;

export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }
  
  function getUserPassword(user: any): string | null {
    // Implement your logic here to retrieve or determine the user's password
    return user.password || null;
  }

// Example declaration and initialization
const userPassword = getUserPassword(user); // Assume getUserPassword is a function returning string or null

const userObject = {
  id: user.id,
  email: user.emailAddresses[0]?.emailAddress || '',
  password: userPassword !== null ? userPassword : '' // Use `userPassword`
};

  const dbUser = await getUser(user.id);
  
  if (!dbUser) {
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      password: userPassword !== null ? userPassword : '' // Convert null to empty string
    };
  }

  return dbUser;
}

export async function requireAuth(): Promise<AuthUser> {
  const session = await clerkAuth();

  if (!session || !session.userId) {
    throw new Error("Unauthorized");
  }

  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function getAuthUserId(): Promise<string> {
  const session = await clerkAuth();
  
  if (!session || !session.userId) {
    throw new Error("Unauthorized");
  }

  return session.userId;
}

export const auth = clerkAuth;