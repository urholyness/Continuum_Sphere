import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, to } = await request.json()

    // Here you would typically send an email using a service like SendGrid, Nodemailer, etc.
    // For now, we'll just log the data and return success
    console.log('Contact form submission:', {
      name,
      email,
      message,
      to: to || 'ourpartners@greenstemglobal.com'
    })

    // In a real implementation, you would:
    // 1. Validate the email format
    // 2. Send email using your preferred service
    // 3. Store in database if needed

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully!' 
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    )
  }
}