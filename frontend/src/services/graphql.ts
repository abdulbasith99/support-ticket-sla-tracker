import type {
  GraphQLErrorItem,
} from "../types";

const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL ??
  "http://localhost:4000/graphql";

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLErrorItem[];
}

export class ApiError extends Error {
  code?: string;

  constructor(
    message: string,
    code?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export async function graphqlRequest<T>(
  query: string,
  variables?: object,
  token?: string | null,
): Promise<T> {
  const response = await fetch(
    GRAPHQL_URL,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
      },

      body: JSON.stringify({
        query,
        variables:
          variables ?? {},
      }),
    },
  );

  const result =
    (await response.json()) as
      GraphQLResponse<T>;

  if (
    result.errors &&
    result.errors.length > 0
  ) {
    const firstError =
      result.errors[0];

    throw new ApiError(
      firstError?.message ??
        "Something went wrong.",
      firstError?.extensions?.code,
    );
  }

  if (!result.data) {
    throw new ApiError(
      "The server returned no data.",
    );
  }

  return result.data;
}