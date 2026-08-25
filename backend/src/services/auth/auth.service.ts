import bcrypt from "bcryptjs";

import { UserRole } from "@prisma/client";

import { prisma } from "../../db/prisma";
import { createToken } from "../../auth";
import { appError } from "../../validation/errors";

import {
  requireNonEmpty,
  validateEmail,
  validatePassword,
} from "../../validation/validators";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(
  input: RegisterInput,
) {
  const name = requireNonEmpty(
    input.name,
    "Name",
  );

  const email = validateEmail(
    input.email,
  );

  const password =
    validatePassword(
      input.password,
    );

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (existingUser) {
    throw appError(
      "A user with this email already exists.",
      "EMAIL_ALREADY_EXISTS",
      409,
    );
  }

  const passwordHash =
    await bcrypt.hash(
      password,
      12,
    );

  /*
   * Public registration always
   * creates a REPORTER.
   *
   * Agent accounts are created
   * through controlled seed/admin
   * processes instead.
   */
  const user =
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: UserRole.REPORTER,
      },
    });

  return {
    token:
      createToken(user.id),

    user,
  };
}

export async function loginUser(
  input: LoginInput,
) {
  const email =
    validateEmail(
      input.email,
    );

  const user =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (!user) {
    throw appError(
      "Invalid email address or password.",
      "INVALID_CREDENTIALS",
      401,
    );
  }

  const passwordMatches =
    await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

  if (!passwordMatches) {
    throw appError(
      "Invalid email address or password.",
      "INVALID_CREDENTIALS",
      401,
    );
  }

  return {
    token:
      createToken(user.id),

    user,
  };
}