import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Please define MONGODB_URI in your environment variables');
}
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

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const visitors = await db.collection('visitors').find({}).sort({ _id: -1 }).toArray();
    const visitorsCount = await db.collection('visitors').countDocuments();
    return NextResponse.json({ visitors, visitorsCount });
  } catch (error: any) {
    console.error("[API/visitors] Error fetching visitors:", error);
    return NextResponse.json({ error: `Failed to fetch visitors: ${error instanceof Error ? error.message : error}` }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { _id, visitedDate } = await req.json();
    if (!_id || !visitedDate) {
      return NextResponse.json({ error: 'Missing _id or visitedDate' }, { status: 400 });
    }
    const { ObjectId } = require('mongodb');
    const result = await db.collection('visitors').updateOne(
      { _id: new ObjectId(_id) },
      { $set: { visitedDate } }
    );
    if (result.modifiedCount === 1) {
      return NextResponse.json({ message: 'Visited date updated' });
    } else {
      return NextResponse.json({ error: 'Visitor not found or not updated' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}

// SMTP/Nodemailer debug and test setup (for troubleshooting)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailhostbox.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  requireTLS: true,
  logger: true,
  debug: true,
});

console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS length:', process.env.SMTP_PASS?.length);

export async function testSMTPConnection() {
  try {
    await transporter.verify();
    console.log('SMTP connection successful');
  } catch (error) {
    console.error('SMTP connection failed:', error);
  }
}
// To test, call: await testSMTPConnection();

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Simulate fetching visitor data from a data source (e.g., database). Replace this with actual data fetching logic.
      const visitorsData = { count: Math.floor(Math.random() * 1000) };
      return res.status(200).json(visitorsData);
    } catch (error) {
      console.error('Error fetching visitors data:', error);
      return res.status(500).json({ error: 'Failed to fetch visitors data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

