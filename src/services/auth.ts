import axios from 'axios';
import { User, mapRoleByUserId } from '../types/user';

const BASE_URL = 'https://fakestoreapi.com';

interface LoginResponse {
  token: string;
}

interface FakeStoreUser {
  id: number;
  username: string;
  email: string;
  name: {
    firstname: string;
    lastname: string;
  };
}

export async function loginRequest(
  username: string,
  password: string
): Promise<{ token: string; user: User }> {
  const { data } = await axios.post<LoginResponse>(`${BASE_URL}/auth/login`, {
    username,
    password,
  });

  const { data: allUsers } = await axios.get<FakeStoreUser[]>(`${BASE_URL}/users`);
  const matchedUser = allUsers.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );

  if (!matchedUser) {
    throw new Error('No se pudo identificar el usuario tras iniciar sesion.');
  }

  const user: User = {
    id: matchedUser.id,
    username: matchedUser.username,
    email: matchedUser.email,
    name: matchedUser.name,
    role: mapRoleByUserId(matchedUser.id),
  };

  return { token: data.token, user };
}
