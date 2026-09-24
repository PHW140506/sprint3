export interface UserGeo {
  lat: string;
  long: string;
}

export interface UserAddress {
  city: string;
  street: string;
  number: number | null;
  zipcode: string;
  geolocation: UserGeo;
}

export interface UserName {
  firstname: string;
  lastname: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  name: UserName;
  address: UserAddress;
  phone: string;
}

const textValue = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

const numberValue = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const objectValue = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export const mapUser = (value: unknown): User => {
  const raw = objectValue(value);
  const rawName = objectValue(raw.name);
  const rawAddress = objectValue(raw.address);
  const rawGeo = objectValue(rawAddress.geolocation);

  return {
    id: numberValue(raw.id) ?? 0,
    email: textValue(raw.email),
    username: textValue(raw.username),
    name: {
      firstname: textValue(rawName.firstname),
      lastname: textValue(rawName.lastname),
    },
    address: {
      city: textValue(rawAddress.city),
      street: textValue(rawAddress.street),
      number: numberValue(rawAddress.number),
      zipcode: textValue(rawAddress.zipcode),
      geolocation: {
        lat: textValue(rawGeo.lat),
        long: textValue(rawGeo.long),
      },
    },
    phone: textValue(raw.phone),
  };
};

export const getFullName = (user: User): string => {
  const fullName = `${user.name.firstname} ${user.name.lastname}`.trim();
  return fullName || user.username || `Usuario #${user.id}`;
};
