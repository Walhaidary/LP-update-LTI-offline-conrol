import { supabase } from '../supabase';

// Categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function createCategory(name: string, description: string) {
  const { error } = await supabase
    .from('categories')
    .insert({ name, description });

  if (error) throw error;
}

// Departments
export async function getDepartments() {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function createDepartment(name: string, description: string) {
  const { error } = await supabase
    .from('departments')
    .insert({ name, description });

  if (error) throw error;
}

// KPIs
export async function getKPIs() {
  const { data, error } = await supabase
    .from('kpis')
    .select(`
      *,
      departments (
        name
      )
    `)
    .order('name');

  if (error) throw error;
  return data;
}

export async function getKPIsByDepartment(departmentName: string) {
  try {
    // First get the department ID
    const { data: department, error: deptError } = await supabase
      .from('departments')
      .select('id')
      .eq('name', departmentName)
      .single();

    if (deptError) throw deptError;
    if (!department) throw new Error('Department not found');

    // Then get KPIs for this department
    const { data: kpis, error: kpisError } = await supabase
      .from('kpis')
      .select('*')
      .eq('department_id', department.id)
      .order('name');

    if (kpisError) throw kpisError;
    return kpis || [];
  } catch (error) {
    console.error('Error in getKPIsByDepartment:', error);
    throw error;
  }
}

export async function createKPI(name: string, departmentId: string, description: string) {
  const { error } = await supabase
    .from('kpis')
    .insert({ name, department_id: departmentId, description });

  if (error) throw error;
}

// Statuses
export async function getStatuses() {
  const { data, error } = await supabase
    .from('statuses')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function getStatusesByCategory(categoryId: string) {
  try {
    // First get the category name
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('name')
      .eq('id', categoryId)
      .single();

    if (categoryError) throw categoryError;
    if (!category) throw new Error('Category not found');

    // Then get statuses for this category
    const { data: statuses, error: statusError } = await supabase
      .from('statuses')
      .select('*')
      .eq('category', category.name)
      .order('name');

    if (statusError) throw statusError;
    return statuses || [];
  } catch (error) {
    console.error('Error in getStatusesByCategory:', error);
    throw error;
  }
}

export async function createStatus(name: string, category: string, description: string, isDefault: boolean) {
  const { error } = await supabase
    .from('statuses')
    .insert({ name, category, description, is_default: isDefault });

  if (error) throw error;
}

// Users
export async function getUsers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, access_level')
    .order('full_name');

  if (error) throw error;
  return data;
}