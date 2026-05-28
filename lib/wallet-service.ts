import { createWalletForUser, demoWallet, now, uid } from "@/lib/mock-data";
import { readJson, STORAGE, writeJson } from "@/lib/storage";
import type { SecurityEvent, Session, User, Wallet } from "@/lib/types";

export function seedDemoAccount() {
  const users = readJson<User[]>(STORAGE.users, []);
  let nextUsers = users;
  const existing = users.find((user) => user.email === "demo@wallax.local");

  if (!existing) {
    nextUsers = [
      ...users,
      {
        id: "user_demo",
        name: "Demo User",
        email: "demo@wallax.local",
        password: "password123",
        emailVerified: false,
        createdAt: now()
      }
    ];
    writeJson(STORAGE.users, nextUsers);
  }

  const wallets = readJson<Wallet[]>(STORAGE.wallets, []);
  if (!wallets.some((wallet) => wallet.userId === "user_demo")) {
    writeJson(STORAGE.wallets, [...wallets, demoWallet("user_demo")]);
  }
}

export function createSession(userId: string): Session {
  const startedAt = now();
  return {
    userId,
    startedAt,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
  };
}

export function createUser(name: string, email: string, password: string): User {
  return {
    id: uid("user"),
    name,
    email: email.toLowerCase(),
    password,
    emailVerified: false,
    createdAt: now()
  };
}

export function createWallet(userId: string, name: string, phrase: string[], source: Wallet["source"]) {
  return createWalletForUser(userId, name, phrase, source);
}

export function addSecurityEvent(events: SecurityEvent[], userId: string, type: string, detail: string) {
  return [
    ...events,
    {
      id: uid("event"),
      userId,
      type,
      detail,
      createdAt: now()
    }
  ];
}
