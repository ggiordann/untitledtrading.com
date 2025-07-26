import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface ApplicationEmailProps {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  jobTitle: string;
  jobType: string;
  coverLetter: string;
  additionalInfo: string;
  submittedAt: string;
}

export const ApplicationEmail = ({
  name,
  email,
  phone,
  linkedin,
  github,
  jobTitle,
  jobType,
  coverLetter,
  additionalInfo,
  submittedAt,
}: ApplicationEmailProps) => {
  const previewText = `New application from ${name} for ${jobTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>UNTITLED TRADING</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h2}>New Job Application</Heading>
            
            <Section style={applicationHeader}>
              <Text style={jobTitleText}>{jobTitle}</Text>
              <Text style={jobTypeText}>{jobType}</Text>
            </Section>

            <Hr style={hr} />

            <Section style={section}>
              <Heading style={h3}>Applicant Information</Heading>
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Name:</Text>
                </Column>
                <Column>
                  <Text style={value}>{name}</Text>
                </Column>
              </Row>
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Email:</Text>
                </Column>
                <Column>
                  <Link href={`mailto:${email}`} style={link}>
                    {email}
                  </Link>
                </Column>
              </Row>
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={label}>Phone:</Text>
                </Column>
                <Column>
                  <Text style={value}>{phone || 'Not provided'}</Text>
                </Column>
              </Row>
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={label}>LinkedIn:</Text>
                </Column>
                <Column>
                  {linkedin && linkedin !== 'Not provided' ? (
                    <Link href={linkedin} style={link}>
                      View Profile
                    </Link>
                  ) : (
                    <Text style={value}>Not provided</Text>
                  )}
                </Column>
              </Row>
              <Row style={infoRow}>
                <Column style={labelColumn}>
                  <Text style={label}>GitHub:</Text>
                </Column>
                <Column>
                  {github && github !== 'Not provided' ? (
                    <Link href={github} style={link}>
                      View Profile
                    </Link>
                  ) : (
                    <Text style={value}>Not provided</Text>
                  )}
                </Column>
              </Row>
            </Section>

            <Hr style={hr} />

            <Section style={section}>
              <Heading style={h3}>Cover Letter</Heading>
              <Text style={coverLetterText}>{coverLetter}</Text>
            </Section>

            {additionalInfo && additionalInfo !== 'None' && (
              <>
                <Hr style={hr} />
                <Section style={section}>
                  <Heading style={h3}>Additional Information</Heading>
                  <Text style={additionalText}>{additionalInfo}</Text>
                </Section>
              </>
            )}

            <Hr style={hr} />

            <Section style={footer}>
              <Text style={footerText}>
                Application submitted on {submittedAt}
              </Text>
              <Button
                style={button}
                href={`mailto:${email}?subject=Re: ${jobTitle} Application at Untitled Trading`}
              >
                Reply to Applicant
              </Button>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#000000',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#111111',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 32px 24px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0',
  letterSpacing: '0.5px',
};

const content = {
  padding: '0 32px',
};

const h2 = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
};

const h3 = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 12px',
};

const applicationHeader = {
  marginBottom: '24px',
};

const jobTitleText = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '500',
  lineHeight: '24px',
  margin: '0',
};

const jobTypeText = {
  color: '#888888',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0 0',
};

const section = {
  marginBottom: '24px',
};

const infoRow = {
  marginBottom: '8px',
};

const labelColumn = {
  width: '120px',
  paddingRight: '12px',
};

const label = {
  color: '#888888',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const value = {
  color: '#ffffff',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const link = {
  color: '#3b82f6',
  fontSize: '14px',
  lineHeight: '20px',
  textDecoration: 'underline',
};

const coverLetterText = {
  color: '#ffffff',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

const additionalText = {
  color: '#ffffff',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

const hr = {
  borderColor: '#333333',
  margin: '24px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  color: '#888888',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 16px',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '40px',
  padding: '0 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
};

export default ApplicationEmail;