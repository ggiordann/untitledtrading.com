import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ApplicationEmail } from '../../../components/emails/ApplicationEmail';
import { headers } from 'next/headers';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = 3; // 3 requests
  const window = 60 * 60 * 1000; // per hour
  
  const requests = rateLimitMap.get(ip) || [];
  const recentRequests = requests.filter((time: number) => now - time < window);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    // Rate limit check
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'jobTitle', 'coverLetter'];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Extract and sanitize form fields
    const jobTitle = (formData.get('jobTitle') as string).slice(0, 100);
    const jobType = (formData.get('jobType') as string).slice(0, 50);
    const name = (formData.get('name') as string).slice(0, 100);
    const email = (formData.get('email') as string).slice(0, 100);
    const phone = (formData.get('phone') as string || 'Not provided').slice(0, 20);
    const linkedin = (formData.get('linkedin') as string || 'Not provided').slice(0, 200);
    const github = (formData.get('github') as string || 'Not provided').slice(0, 200);
    const coverLetter = (formData.get('coverLetter') as string).slice(0, 5000);
    const additionalInfo = (formData.get('additionalInfo') as string || 'None').slice(0, 2000);
    const resumeFile = formData.get('resume') as File;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Handle resume file with size limit
    let resumeBuffer: Buffer | null = null;
    let resumeFilename = '';
    
    if (resumeFile) {
      // 5MB file size limit
      if (resumeFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'Resume file size must be less than 5MB' },
          { status: 400 }
        );
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(resumeFile.type)) {
        return NextResponse.json(
          { success: false, message: 'Resume must be PDF or Word document' },
          { status: 400 }
        );
      }
      
      resumeFilename = resumeFile.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
      const arrayBuffer = await resumeFile.arrayBuffer();
      resumeBuffer = Buffer.from(arrayBuffer);
    }

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: 'Untitled Trading <onboarding@resend.dev>', // Using Resend's test domain
      to: ['giordan.masen@gmail.com'],
      subject: `New Application: ${jobTitle} - ${name}`,
      react: ApplicationEmail({
        name,
        email,
        phone,
        linkedin,
        github,
        jobTitle,
        jobType,
        coverLetter,
        additionalInfo,
        submittedAt: new Date().toLocaleString(),
      }),
      attachments: resumeBuffer ? [{
        filename: resumeFilename,
        content: resumeBuffer
      }] : []
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { success: false, message: 'Error submitting application. Please try again later.' },
        { status: 500 }
      );
    }

    // Send confirmation email to applicant
    await resend.emails.send({
      from: 'Untitled Trading <onboarding@resend.dev>',
      to: [email],
      subject: `Application Received - ${jobTitle} at Untitled Trading`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for applying to Untitled Trading!</h2>
          
          <p>Hi ${name},</p>
          
          <p>We've received your application for the <strong>${jobTitle}</strong> position. Our team will review your application and get back to you within 3-5 business days.</p>
          
          <p>Best regards,<br>
          The Untitled Trading Team</p>
        </div>
      `
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Application submitted successfully' 
    });

  } catch (error) {
    console.error('Error processing application:', error);
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { success: false, message: 'Error submitting application. Please try again later.' },
      { status: 500 }
    );
  }
}