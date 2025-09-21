// Debug Environment Variables Route
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const envVars = {
      EOS_API_KEY: process.env.EOS_API_KEY ? 'SET' : 'NOT SET',
      SENTINEL_HUB_CLIENT_ID: process.env.SENTINEL_HUB_CLIENT_ID ? 'SET' : 'NOT SET',
      SENTINEL_HUB_CLIENT_SECRET: process.env.SENTINEL_HUB_CLIENT_SECRET ? 'SET' : 'NOT SET',
      ACCUWEATHER_API_KEY: process.env.ACCUWEATHER_API_KEY ? 'SET' : 'NOT SET',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET',
      AWS_REGION: process.env.AWS_REGION || 'NOT SET'
    };

    const allSet = Object.values(envVars).every(status => status === 'SET');

    return NextResponse.json({
      success: allSet,
      message: allSet ? 'All environment variables are loaded' : 'Some environment variables are missing',
      environment: envVars,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Environment debug error:', error);
    return NextResponse.json({
      success: false,
      message: 'Environment debug failed',
      error: error.message
    }, { status: 500 });
  }
}

