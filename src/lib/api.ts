const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
};

export class ApiRequestError extends Error {
  code: string;
  fields?: Record<string, string[]>;
  status: number;

  constructor(error: ApiError, status: number) {
    super(error.message);
    this.code = error.code;
    this.fields = error.fields;
    this.status = status;
  }
}

// Quelques messages de validation Laravel connus, traduits côté front en
// attendant un fichier de langue fr côté backend (lang/fr/validation.php).
const TRADUCTIONS_CHAMPS: Record<string, string> = {
  "The email has already been taken.": "Cette adresse e-mail est déjà utilisée.",
  "The email field must be a valid email address.": "L'adresse e-mail n'est pas valide.",
};

function traduire(message: string): string {
  return TRADUCTIONS_CHAMPS[message] ?? message;
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    const error: ApiError = json?.error ?? {
      code: "SERVER_ERROR",
      message: "Une erreur est survenue, réessayez.",
    };

    if (error.fields) {
      for (const champ of Object.keys(error.fields)) {
        error.fields[champ] = error.fields[champ].map(traduire);
      }
    }

    throw new ApiRequestError(error, response.status);
  }

  return json.data as T;
}
