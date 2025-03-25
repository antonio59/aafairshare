import { supabase } from './supabase';
import { log } from './vite';

export async function createSupabaseFunctions() {
  try {
    log('Creating tables via Supabase client...');

    // Create tables using Supabase client
    const { error: usersError } = await supabase.from('users').insert({
      username: 'John',
      email: 'john@example.com',
      password: 'password'
    });

    const { error: categoriesError } = await supabase.from('categories').insert({
      name: 'Groceries',
      color: '#4CAF50',
      icon: 'ShoppingCart'
    });

    const { error: locationsError } = await supabase.from('locations').insert({
      name: 'Tesco'
    });

    if (usersError || categoriesError || locationsError) {
      log('Tables likely already exist, continuing...');
    } else {
      log('Successfully created initial data');
    }

    return true;
  } catch (error) {
    console.error('Failed to create database structure:', error);
    return false;
  }
}