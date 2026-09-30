import { supabase } from './supabase';

export async function signUp(
  email: string,
  password: string,
  username: string
) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();

  console.log('SIGN UP EMAIL:', cleanEmail);

  return await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        username: cleanUsername,
        display_name: cleanUsername,
      },
    },
  });
}

export async function signIn(
  email: string,
  password: string
) {
  const cleanEmail = email.trim().toLowerCase();

  console.log('SIGN IN EMAIL:', cleanEmail);
  console.log('PASSWORD LENGTH:', password.length);

  const result = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (result.error) {
    console.log('SUPABASE SIGN IN ERROR:', {
      message: result.error.message,
      code: result.error.code,
      status: result.error.status,
    });
  } else {
    console.log('SUPABASE SIGN IN SUCCESS');
    console.log('USER ID:', result.data.user?.id);
  }

  return result;
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.log('GET USER ERROR:', error.message);
    return null;
  }

  return user;
}

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.log('GET SESSION ERROR:', error.message);
    return null;
  }

  return session;
}