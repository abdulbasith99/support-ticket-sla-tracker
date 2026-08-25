import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { prisma } from "./db/prisma";
import { appError } from "./validation/errors";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface TokenPayload {
  userId: string;
}

export interface GraphQLContext {
  currentUser: AuthUser | null;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export function createToken(userId: string): string {
  return jwt.sign(
    { userId } satisfies TokenPayload,
    getJwtSecret(),
    {
      expiresIn: "1d",
    },
  );
}

export async function getCurrentUser(
  authorizationHeader: string | null,
): Promise<AuthUser | null> {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] =
    authorizationHeader.split(" ");

  if (
    scheme !== "Bearer" ||
    !token
  ) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      getJwtSecret(),
    );

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string"
    ) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export function requireAuthentication(
  context: GraphQLContext,
): AuthUser {
  if (!context.currentUser) {
    throw appError(
      "Authentication is required.",
      "UNAUTHORIZED",
      401,
    );
  }

  return context.currentUser;
}

export function requireAgent(
  context: GraphQLContext,
): AuthUser {
  const user = requireAuthentication(context);

  if (user.role !== "AGENT") {
    throw appError(
      "This operation is restricted to agents.",
      "FORBIDDEN",
      403,
    );
  }

  return user;
}