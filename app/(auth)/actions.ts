"use server";

import { z } from "zod";
import bcrypt from 'bcryptjs';
import base from "@/lib/airtable";
import { clerkClient } from "@clerk/nextjs/server";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data" | "user_not_found";
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Check if the user exists in the Airtable database
    const records = await base("Users")
      .select({ filterByFormula: `{email} = '${validatedData.email}'`, maxRecords: 1 })
      .firstPage();

    if (records.length === 0) {
      return { status: "user_not_found" };
    }

    const user = records[0].fields;
    const passwordMatch = await bcrypt.compare(validatedData.password, user.password_hash as string);

    if (!passwordMatch) {
      return { status: "failed" };
    }

    // Retrieve the user from Clerk using the user's Airtable record ID
    const clerkUser = await clerkClient.users.getUser(records[0].id as string);

    if (clerkUser) {
      return { status: "success" };
    } else {
      return { status: "failed" };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    console.error("Login error:", error);
    return { status: "failed" };
  }
};

export interface RegisterActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "user_exists" | "invalid_data";
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Check if the user already exists in Airtable
    const existingUser = await base("Users")
      .select({ filterByFormula: `{email} = '${validatedData.email}'`, maxRecords: 1 })
      .firstPage();

    if (existingUser.length > 0) {
      return { status: "user_exists" };
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Save the user to Airtable
    const newUser = await base("Users").create({
      email: validatedData.email,
      password_hash: hashedPassword,
    });

    // Create the user in Clerk
    await clerkClient.users.createUser({
      emailAddress: [validatedData.email],
      password: validatedData.password,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    console.error("Registration error:", error);
    return { status: "failed" };
  }
};