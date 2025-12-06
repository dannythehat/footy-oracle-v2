import nodemailer from 'nodemailer';
import { IBetBuilder } from '../models/BetBuilder.js';

/**
 * Email notification service for Bet Builders
 */

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email transporter (configure with your SMTP settings)
const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };

  return nodemailer.createTransporter(config);
};

/**
 * Generate HTML email template for bet builder notification
 */
function generateBetBuilderEmail(betBuilders: IBetBuilder[]): string {
  const betBuilderCards = betBuilders.map(bb => `
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 1px solid #a855f7; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <span style="font-size: 32px; margin-right: 10px;">🧠</span>
        <div>
          <h3 style="color: #ffffff; margin: 0; font-size: 18px;">${bb.homeTeam} vs ${bb.awayTeam}</h3>
          <p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 14px;">${bb.league} • ${new Date(bb.kickoff).toLocaleString()}</p>
        </div>
      </div>
      
      <div style="background: rgba(168, 85, 247, 0.1); border-radius: 8px; padding: 15px; margin-bottom: 15px;">
        <h4 style="color: #a855f7; margin: 0 0 10px 0; font-size: 14px;">Multi-Market Convergence</h4>
        ${bb.markets.map(m => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #ffffff; font-size: 14px;">${m.marketName}</span>
            <span style="color: #a855f7; font-weight: bold; font-size: 14px;">${m.estimatedOdds.toFixed(2)} @ ${m.confidence}%</span>
          </div>
        `).join('')}
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
        <div>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">Combined Confidence</p>
          <p style="color: #a855f7; margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">${bb.combinedConfidence}%</p>
        </div>
        <div>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">Combined Odds</p>
          <p style="color: #ec4899; margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">${bb.estimatedCombinedOdds.toFixed(2)}x</p>
        </div>
      </div>
      
      <div style="background: rgba(251, 191, 36, 0.1); border-radius: 8px; padding: 12px;">
        <p style="color: #9ca3af; margin: 0; font-size: 12px;">€10 Stake Returns</p>
        <p style="color: #fbbf24; margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">€${(bb.estimatedCombinedOdds * 10).toFixed(2)}</p>
        <p style="color: #10b981; margin: 5px 0 0 0; font-size: 14px;">Profit: €${((bb.estimatedCombinedOdds * 10) - 10).toFixed(2)}</p>
      </div>
      
      ${bb.aiReasoning ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(168, 85, 247, 0.3);">
          <p style="color: #a855f7; margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">🧠 AI Analysis</p>
          <p style="color: #d1d5db; margin: 0; font-size: 13px; line-height: 1.6;">${bb.aiReasoning}</p>
        </div>
      ` : ''}
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Today's Bet Builder Opportunities</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="background: linear-gradient(to right, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0;">
            🧠 Bet Builder Brain
          </h1>
          <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 16px;">Today's High-Value Multi-Market Opportunities</p>
        </div>
        
        ${betBuilderCards}
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #374151;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This is an automated notification from Footy Oracle.<br>
            These predictions are AI-generated and should be used for informational purposes only.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send bet builder notification email
 */
export async function sendBetBuilderNotification(
  recipients: string[],
  betBuilders: IBetBuilder[]
): Promise<void> {
  if (betBuilders.length === 0) {
    console.log('No bet builders to send');
    return;
  }

  const transporter = createTransporter();
  const html = generateBetBuilderEmail(betBuilders);

  const mailOptions = {
    from: `"Footy Oracle 🧠" <${process.env.SMTP_USER}>`,
    to: recipients.join(', '),
    subject: `🧠 ${betBuilders.length} High-Value Bet Builder${betBuilders.length > 1 ? 's' : ''} Today!`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Bet builder notification sent to ${recipients.length} recipient(s)`);
  } catch (error) {
    console.error('Error sending bet builder notification:', error);
    throw error;
  }
}

/**
 * Send daily bet builder digest
 */
export async function sendDailyBetBuilderDigest(
  subscribers: Array<{ email: string; name?: string }>,
  betBuilders: IBetBuilder[]
): Promise<void> {
  const emails = subscribers.map(s => s.email);
  await sendBetBuilderNotification(emails, betBuilders);
}

/**
 * Send bet builder result notification
 */
export async function sendBetBuilderResult(
  recipients: string[],
  betBuilder: IBetBuilder
): Promise<void> {
  const transporter = createTransporter();
  
  const resultEmoji = betBuilder.result === 'win' ? '✅' : '❌';
  const resultColor = betBuilder.result === 'win' ? '#10b981' : '#ef4444';
  const resultText = betBuilder.result === 'win' ? 'WON' : 'LOST';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bet Builder Result</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: ${resultColor}; font-size: 48px; margin: 0;">${resultEmoji}</h1>
          <h2 style="color: #ffffff; margin: 10px 0;">Bet Builder ${resultText}</h2>
        </div>
        
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 2px solid ${resultColor}; border-radius: 12px; padding: 20px;">
          <h3 style="color: #ffffff; margin: 0 0 10px 0;">${betBuilder.homeTeam} vs ${betBuilder.awayTeam}</h3>
          <p style="color: #9ca3af; margin: 0 0 20px 0;">${betBuilder.league}</p>
          
          <div style="margin-bottom: 20px;">
            ${betBuilder.markets.map(m => `
              <div style="color: #d1d5db; margin-bottom: 5px;">✓ ${m.marketName}</div>
            `).join('')}
          </div>
          
          <div style="display: flex; justify-content: space-between; padding: 15px; background: rgba(168, 85, 247, 0.1); border-radius: 8px;">
            <div>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">Combined Odds</p>
              <p style="color: #a855f7; margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">${betBuilder.estimatedCombinedOdds.toFixed(2)}x</p>
            </div>
            <div>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">Profit/Loss</p>
              <p style="color: ${resultColor}; margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">€${(betBuilder.profit || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Footy Oracle 🧠" <${process.env.SMTP_USER}>`,
    to: recipients.join(', '),
    subject: `${resultEmoji} Bet Builder ${resultText}: ${betBuilder.homeTeam} vs ${betBuilder.awayTeam}`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Bet builder result notification sent`);
  } catch (error) {
    console.error('Error sending result notification:', error);
    throw error;
  }
}
