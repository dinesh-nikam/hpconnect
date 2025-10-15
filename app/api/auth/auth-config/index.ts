import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || 'mongodb+srv://nikamdinesh362:9a8HqC3bFTvzWsTb@hpstore.tvrmvws.mongodb.net/?retryWrites=true&w=majority&appName=hpstore';
const dbName = process.env.MONGODB_DB || 'vms';

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

async function getAdmin(username: string) {
  const { db } = await connectToDatabase();
  const admin = await db.collection('admins').findOne({ username });
  return admin;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const admin = await getAdmin(credentials.username);
        if (admin && credentials.password && admin.password === credentials.password) {
          return { id: admin._id.toString(), name: admin.username };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin",
    error: "/admin", 
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
};