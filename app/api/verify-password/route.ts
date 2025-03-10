import { NextResponse } from 'next/server';

// Handler for POST requests
export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const { password } = body;

    // Get password from environment variables
    const correctPassword = process.env.PASSWORD;

    // Ensure password is configured
    if (!correctPassword) {
      console.error('PASSWORD environment variable is not set');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Validate password
    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error processing password verification:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing request' },
      { status: 400 }
    );
  }
}