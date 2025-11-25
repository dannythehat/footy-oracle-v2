import { Router } from 'express';
import { sendBetBuilderNotification, sendBetBuilderResult } from '../services/notificationService.js';
import { getTodaysBetBuilders } from '../services/betBuilderService.js';
import { BetBuilder } from '../models/BetBuilder.js';

const router = Router();

// In-memory storage for subscribers (replace with database in production)
const subscribers = new Map<string, { email: string; name?: string; preferences: any }>();

/**
 * POST /api/notifications/subscribe
 * Subscribe to bet builder notifications
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name, preferences } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Valid email address is required',
      });
    }

    subscribers.set(email, {
      email,
      name,
      preferences: preferences || {
        dailyDigest: true,
        results: true,
        highConfidence: true,
      },
    });

    res.json({
      success: true,
      message: 'Successfully subscribed to bet builder notifications',
      data: { email, name },
    });
  } catch (error: any) {
    console.error('Error subscribing to notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe from bet builder notifications
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required',
      });
    }

    const existed = subscribers.has(email);
    subscribers.delete(email);

    res.json({
      success: true,
      message: existed 
        ? 'Successfully unsubscribed from notifications' 
        : 'Email was not subscribed',
    });
  } catch (error: any) {
    console.error('Error unsubscribing from notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/notifications/subscribers
 * Get list of subscribers (admin only)
 */
router.get('/subscribers', async (req, res) => {
  try {
    const subscriberList = Array.from(subscribers.values());
    
    res.json({
      success: true,
      data: subscriberList,
      count: subscriberList.length,
    });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/notifications/send-daily
 * Send daily bet builder digest to all subscribers
 */
router.post('/send-daily', async (req, res) => {
  try {
    const betBuilders = await getTodaysBetBuilders();

    if (betBuilders.length === 0) {
      return res.json({
        success: true,
        message: 'No bet builders to send today',
        sent: 0,
      });
    }

    const subscriberList = Array.from(subscribers.values())
      .filter(s => s.preferences?.dailyDigest !== false);

    if (subscriberList.length === 0) {
      return res.json({
        success: true,
        message: 'No subscribers to send to',
        sent: 0,
      });
    }

    const emails = subscriberList.map(s => s.email);
    await sendBetBuilderNotification(emails, betBuilders);

    res.json({
      success: true,
      message: `Daily digest sent to ${emails.length} subscriber(s)`,
      sent: emails.length,
      betBuilders: betBuilders.length,
    });
  } catch (error: any) {
    console.error('Error sending daily digest:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/notifications/send-result/:id
 * Send bet builder result notification
 */
router.post('/send-result/:id', async (req, res) => {
  try {
    const betBuilder = await BetBuilder.findById(req.params.id);

    if (!betBuilder) {
      return res.status(404).json({
        success: false,
        error: 'Bet builder not found',
      });
    }

    if (!betBuilder.result || betBuilder.result === 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Bet builder result is not yet available',
      });
    }

    const subscriberList = Array.from(subscribers.values())
      .filter(s => s.preferences?.results !== false);

    if (subscriberList.length === 0) {
      return res.json({
        success: true,
        message: 'No subscribers to send to',
        sent: 0,
      });
    }

    const emails = subscriberList.map(s => s.email);
    await sendBetBuilderResult(emails, betBuilder);

    res.json({
      success: true,
      message: `Result notification sent to ${emails.length} subscriber(s)`,
      sent: emails.length,
      result: betBuilder.result,
    });
  } catch (error: any) {
    console.error('Error sending result notification:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/notifications/test
 * Send test notification to a specific email
 */
router.post('/test', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Valid email address is required',
      });
    }

    const betBuilders = await getTodaysBetBuilders();

    if (betBuilders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No bet builders available to send',
      });
    }

    await sendBetBuilderNotification([email], betBuilders.slice(0, 2));

    res.json({
      success: true,
      message: `Test notification sent to ${email}`,
    });
  } catch (error: any) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
