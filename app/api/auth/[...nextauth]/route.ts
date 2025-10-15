import NextAuth from "next-auth";
import { authOptions } from "../auth-config";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";

// This is a workaround for the NextAuth types issue with App Router
function adaptNextRequestForNextAuth(req: NextRequest) {
  // @ts-ignore - These properties are required by NextAuth.js
  req.query = Object.fromEntries(new URL(req.url).searchParams);
  // @ts-ignore
  req.cookies = Object.fromEntries(
    req.cookies.getAll().map((c) => [c.name, c.value])
  );
  return req as unknown as NextApiRequest;
}

async function handler(req: NextRequest) {
  const adaptedReq = adaptNextRequestForNextAuth(req);
  // @ts-ignore - Response type mismatch is expected
  const res = { end: () => {}, getHeader: () => {}, setHeader: () => {} } as NextApiResponse;
  
  return NextAuth(authOptions)(adaptedReq, res);
}

export const GET = handler;
export const POST = handler;

// Make sure these are set for Vercel
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
