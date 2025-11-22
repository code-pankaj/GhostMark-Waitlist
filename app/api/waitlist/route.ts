import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Connect to database
    const sql = neon(process.env.DATABASE_URL!);

    // Try to insert email
    try {
      await sql`
        INSERT INTO waitlist (email)
        VALUES (${email.toLowerCase()})
      `;

      return NextResponse.json(
        { message: 'Successfully joined the waitlist!' },
        { status: 201 }
      );
    } catch (dbError: any) {
      // Check if error is due to unique constraint violation
      if (dbError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already joined the waitlist!' },
          { status: 409 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Waitlist API Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
