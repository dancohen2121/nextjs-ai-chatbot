import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { cookies } from 'next/headers';

import { Chat } from '@/components/custom/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/model';
import { generateUUID } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';

export default async function Dashboard() {
  // Generate a unique ID for the Chat component
  const id = generateUUID();

  // Access cookies without awaiting
  const cookieStore = cookies();
  const value = (await cookieStore).get('model')?.value;

  // Set the selected model name from cookies or use the default
  const selectedModelName =
    models.find((m) => m.name === value)?.name || DEFAULT_MODEL_NAME;

  return (
    <SidebarProvider>
      <SignedIn>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          selectedModelName={selectedModelName}
        />
        <div>Dashboard content for authenticated users.</div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </SidebarProvider>
  );
}