export type Role = 'admin' | 'auditor' | 'cliente';

export interface User {
  id: number;
  username: string;
  role: Role;
  email?: string;
  name?: {
    firstname: string;
    lastname: string;
  };
}

export interface AuthSession {
  token: string;
  user: User;
}

// Regla de negocio de la US01:
// IDs 1 y 2 -> Administrador | ID 3 -> Auditor | resto -> Cliente
export function mapRoleByUserId(id: number): Role {
  if (id === 1 || id === 2) return 'admin';
  if (id === 3) return 'auditor';
  return 'cliente';
}
