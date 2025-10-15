import { NextRequest, NextResponse } from 'next/server';
import { formSchema } from '../validationSchema';
import { MongoClient } from 'mongodb';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import nodemailer from 'nodemailer';
import 'dotenv/config';



const uri = process.env.MONGODB_URI || 'mongodb+srv://nikamdinesh362:9a8HqC3bFTvzWsTb@hpstore.tvrmvws.mongodb.net/?retryWrites=true&w=majority&appName=hpstore';
const dbName = process.env.MONGODB_DB || 'vms';

let cachedClient: MongoClient | null = null;
let cachedDb: ReturnType<MongoClient['db']> | null = null;

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


const smtpHost = typeof process.env.SMTP_HOST === 'string' && process.env.SMTP_HOST.trim() !== '' ? process.env.SMTP_HOST : 'smtp.office365.com';

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  requireTLS: true,
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development',
} as SMTPTransport.Options);

// Verify SMTP connection using STARTTLS before sending email
async function verifySmtpConnection() {
  return new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP Connection Error:', error);
        reject(error);
      } else {
        console.log('SMTP Connection Successful');
        resolve(success);
      }
    });
  });
}

export const config = {
  maxDuration: 30 // Set max duration for Netlify function (in seconds)
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  try {
    // Add timeout handling
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Function timeout')), 29000)
    );

    const responsePromise = (async (): Promise<NextResponse> => {
      const body = await req.json();
      const parsed = formSchema.parse(body);

      // Save to MongoDB
      const { db } = await connectToDatabase();
      // Ensure visitedDate is just a date string (YYYY-MM-DD)
      let visitedDate = parsed.visitedDate;
      if (visitedDate) {
        // If visitedDate is a Date or datetime string, convert to YYYY-MM-DD
        visitedDate = new Date(visitedDate).toISOString().slice(0, 10);
      } else {
        
        visitedDate = new Date().toISOString().slice(0, 10);
      }
    // Verif\l
    try {
      console.log('[Email] Starting email send process...');
      console.log('[Email] SMTP Configuration:', {
        host: smtpHost,
        port: 587,
        user: process.env.SMTP_USER ? '✓ Set' : '✗ Missing',
        pass: process.env.SMTP_PASS ? '✓ Set' : '✗ Missing'
      });
      
      await verifySmtpConnection();
      console.log('[Email] SMTP connection verified successfully');
      
      await transporter.sendMail({
        to: parsed.email || "",
        from: process.env.SMTP_USER || "",
        subject: 'Thank you for your feedback!',
        html: `<div style="font-family: Arial, sans-serif;">
          <p>Dear ${parsed.firstName} ${parsed.lastName},</p>
          <p>Successfully Submitted feedback!</p>
          <p>Thank you for visiting our centre and sharing your feedback.<br>We truly appreciate your time.</p>
          <p>Looking forward to seeing you again soon!</p>
          <br>
          <p>Best Regards,<br>Team HP Connect Centre<br>
        <a href="tel:+9699766932">
            9699766932</a><br>hpconnect@ithpl.com</p>
          <p>4th Floor, Innovative Tower,<br> opposite Zensar Technologies, Rakshak Nagar,<br> Kharadi, Pune, Maharashtra 411014</p>
          

       <img src="https://emailtemplate23.netlify.app/hpconnect_footer.jpg" alt="HP Logo" style="width:120px; margin-bottom:16px;" />


        </div>`,
        text: `Dear ${parsed.firstName} ${parsed.lastName},\n\nSuccessfully Submitted feedback!\n\nThank you for visiting our store and sharing your feedback.\n\nWe truly appreciate your time.\n\nLooking forward to seeing you again soon!\n\nBest Regards,\nTeam HP Connect Center`,
      });
      console.log('Email sent successfully');
    } catch (emailError: any) {
      console.error("[API/submit] SMTP error details:", {
        error: emailError.message,
        code: emailError.code,
        command: emailError.command,
        responseCode: emailError.responseCode,
        response: emailError.response
      });
      return NextResponse.json({ 
        error: 'Form saved, but email could not be sent.',
        details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      }, { status: 500 });
    }
    

    // Send WhatsApp confirmation message using WhatsApp Business API (Meta Cloud API) only
    let whatsappLink = null;
    let whatsappStatus = 'not_sent';
    try {
      if (parsed.mobile) {
        const waNumber = parsed.mobile.startsWith('+') ? parsed.mobile : `+91${parsed.mobile}`;
        // WhatsApp Business API (Meta Cloud API) integration
        // Ensure waNumber is in E.164 format (country code + number, no spaces or dashes)
        const e164Number = waNumber.replace(/[^\d]/g, '');
        if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
          const apiUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
          // Always use the approved template for WhatsApp message
          const templatePayload = {
            messaging_product: 'whatsapp',
            to: e164Number,
            type: 'template',
            template: {
              name: 'feedback', // <-- Replace with your actual template name
              language: { code: 'en' },
              // If your template has parameters, add them here:
              // components: [
              //   {
              //     type: 'body',
              //     parameters: [
              //       { type: 'text', text: 'HP Connect Center' },
              //       // ...other parameters as per your template...
              //     ]
              //   }
              // ]
            }
          };
          console.log('[WhatsApp API] Sending template payload:', JSON.stringify(templatePayload));
          const templateRes = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(templatePayload),
          });
          const templateResBody = await templateRes.json().catch(() => ({}));
          console.log('[WhatsApp API] Template response:', templateRes.status, templateRes.statusText, templateResBody);
          if (templateRes.ok && templateResBody.messages && templateResBody.messages[0] && templateResBody.messages[0].id) {
            console.log('wamid:', templateResBody.messages[0].id);
            whatsappStatus = 'sent_template';
            console.log('[API/submit] WhatsApp template message sent successfully');
          } else {
            console.error('[WhatsApp API] Template message failed:', templateResBody);
            whatsappLink = `https://wa.me/${e164Number}?text=${encodeURIComponent('Thank you for your feedback at HP Connect Center! Your submission has been received.')}`;
            whatsappStatus = 'fallback_link';
            console.log('[API/submit] WhatsApp API failed, fallback link:', whatsappLink);
          }
        } else {
          // If API not configured, fallback to wa.me link
          whatsappLink = `https://wa.me/${waNumber.replace('+', '')}?text=${encodeURIComponent('Thank you for your feedback at HP Connect Center! Your submission has been received.')}`;
          whatsappStatus = 'fallback_link';
          console.log('[API/submit] WhatsApp API not configured, fallback link:', whatsappLink);
        }
>>>>>>> 5b1ee7f1250653ea7a4c64f1e7aaa58a0f95e086
      }
      const visitorWithDate = { ...parsed, visitedDate, createdAt: new Date() };
      await db.collection('visitors').insertOne(visitorWithDate);

      // Verify SMTP connection before sending email
      try {
        await verifySmtpConnection();
        await transporter.sendMail({
          to: parsed.email || "",
          from: process.env.SMTP_USER || "",
          subject: 'Thank you for your feedback!',
          html: `<div style="font-family: Arial, sans-serif;">
            <p>Dear ${parsed.firstName} ${parsed.lastName},</p>
            <p>Successfully Submitted feedback!</p>
            <p>Thank you for visiting our centre and sharing your feedback.<br>We truly appreciate your time.</p>
            <p>Looking forward to seeing you again soon!</p>
            <br>
            <p>Best Regards,<br>Team HP Connect Centre<br>
          <a href="tel:+9699766932">
              9699766932</a><br>hpconnect@ithpl.com</p>
            <p>4th Floor, Innovative Tower,<br> opposite Zensar Technologies, Rakshak Nagar,<br> Kharadi, Pune, Maharashtra 411014</p>
            

         <img src="https://emailtemplate23.netlify.app/hpconnect_footer.jpg" alt="HP Logo" style="width:120px; margin-bottom:16px;" />


          </div>`,
          text: `Dear ${parsed.firstName} ${parsed.lastName},\n\nSuccessfully Submitted feedback!\n\nThank you for visiting our store and sharing your feedback.\n\nWe truly appreciate your time.\n\nLooking forward to seeing you again soon!\n\nBest Regards,\nTeam HP Connect Center`,
        });
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error("[API/submit] SMTP error:", emailError);
        return NextResponse.json({ error: 'Form saved, but email could not be sent.' }, { status: 500 });
      }
      

      // Send WhatsApp confirmation message using WhatsApp Business API (Meta Cloud API) only
      let whatsappLink = null;
      let whatsappStatus = 'not_sent';
      try {
        if (parsed.mobile) {
          const waNumber = parsed.mobile.startsWith('+') ? parsed.mobile : `+91${parsed.mobile}`;
          // WhatsApp Business API (Meta Cloud API) integration
          // Ensure waNumber is in E.164 format (country code + number, no spaces or dashes)
          const e164Number = waNumber.replace(/[^\d]/g, '');
          if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
            const apiUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
            // Always use the approved template for WhatsApp message
            const templatePayload = {
              messaging_product: 'whatsapp',
              to: e164Number,
              type: 'template',
              template: {
                name: 'feedback', // <-- Replace with your actual template name
                language: { code: 'en' },
                // If your template has parameters, add them here:
                // components: [
                //   {
                //     type: 'body',
                //     parameters: [
                //       { type: 'text', text: 'HP Connect Center' },
                //       // ...other parameters as per your template...
                //     ]
                //   }
                // ]
              }
            };
            console.log('[WhatsApp API] Sending template payload:', JSON.stringify(templatePayload));
            const templateRes = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(templatePayload),
            });
            const templateResBody = await templateRes.json().catch(() => ({}));
            console.log('[WhatsApp API] Template response:', templateRes.status, templateRes.statusText, templateResBody);
            if (templateRes.ok && templateResBody.messages && templateResBody.messages[0] && templateResBody.messages[0].id) {
              console.log('wamid:', templateResBody.messages[0].id);
              whatsappStatus = 'sent_template';
              console.log('[API/submit] WhatsApp template message sent successfully');
            } else {
              console.error('[WhatsApp API] Template message failed:', templateResBody);
              whatsappLink = `https://wa.me/${e164Number}?text=${encodeURIComponent('Thank you for your feedback at HP Connect Center! Your submission has been received.')}`;
              whatsappStatus = 'fallback_link';
              console.log('[API/submit] WhatsApp API failed, fallback link:', whatsappLink);
            }
          } else {
            // If API not configured, fallback to wa.me link
            whatsappLink = `https://wa.me/${waNumber.replace('+', '')}?text=${encodeURIComponent('Thank you for your feedback at HP Connect Center! Your submission has been received.')}`;
            whatsappStatus = 'fallback_link';
            console.log('[API/submit] WhatsApp API not configured, fallback link:', whatsappLink);
          }
        }
      } catch (waError) {
        whatsappStatus = 'error';
        console.error('[API/submit] WhatsApp message error:', waError);
      }

      return NextResponse.json(
        { message: 'Form submitted successfully', whatsappStatus, whatsappLink },
        { headers }
      );
    })();

    const result = await Promise.race([responsePromise, timeoutPromise]);
    return result as NextResponse;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500, headers }
    );
  }
}

console.log('SMTP Debug Info:', {
  host: process.env.SMTP_HOST,
  port: 587,
  user: process.env.SMTP_USER,
  passLength: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0,
  secure: false,
  requireTLS: true
});

// To receive delivery status and message events, configure your WhatsApp webhook in the Meta Developer Portal for your app.