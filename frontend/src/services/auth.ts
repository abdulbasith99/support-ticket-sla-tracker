import {
  graphqlRequest,
} from "./graphql";

import type {
  AuthPayload,
} from "../types";

interface LoginResponse {
  login: AuthPayload;
}

interface RegisterResponse {
  register: AuthPayload;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthPayload> {
  const query = `
    mutation Login(
      $email: String!
      $password: String!
    ) {
      login(
        email: $email
        password: $password
      ) {
        token

        user {
          id
          name
          email
          role
        }
      }
    }
  `;

  const data =
    await graphqlRequest<LoginResponse>(
      query,
      {
        email,
        password,
      },
    );

  return data.login;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthPayload> {
  const query = `
    mutation Register(
      $name: String!
      $email: String!
      $password: String!
    ) {
      register(
        name: $name
        email: $email
        password: $password
      ) {
        token

        user {
          id
          name
          email
          role
        }
      }
    }
  `;

  const data =
    await graphqlRequest<RegisterResponse>(
      query,
      {
        name,
        email,
        password,
      },
    );

  return data.register;
}