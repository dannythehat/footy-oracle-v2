export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

class NotificationService {
  private permission: NotificationPermission = 'default';

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  async show(options: NotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('Notification permission denied');
        return;
      }
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag,
      data: options.data,
      badge: '/favicon.ico',
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
    };
  }

  async notifyFixtureStarting(
    homeTeam: string,
    awayTeam: string,
    fixtureId: number,
    minutesUntilStart: number
  ): Promise<void> {
    await this.show({
      title: '⚽ Match Starting Soon!',
      body: `${homeTeam} vs ${awayTeam} starts in ${minutesUntilStart} minutes`,
      tag: `fixture-${fixtureId}`,
      data: {
        fixtureId,
        url: `/fixtures?highlight=${fixtureId}`,
      },
    });
  }

  async notifyGoldenBet(
    homeTeam: string,
    awayTeam: string,
    fixtureId: number,
    betType: string
  ): Promise<void> {
    await this.show({
      title: '🌟 Golden Bet Alert!',
      body: `${homeTeam} vs ${awayTeam} - ${betType}`,
      tag: `golden-bet-${fixtureId}`,
      data: {
        fixtureId,
        url: `/fixtures?highlight=${fixtureId}`,
      },
    });
  }

  async notifyGoal(
    homeTeam: string,
    awayTeam: string,
    scoringTeam: string,
    score: string,
    fixtureId: number
  ): Promise<void> {
    await this.show({
      title: '⚽ GOAL!',
      body: `${scoringTeam} scores! ${homeTeam} ${score} ${awayTeam}`,
      tag: `goal-${fixtureId}`,
      data: {
        fixtureId,
        url: `/fixtures?highlight=${fixtureId}`,
      },
    });
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }
}

export const notificationService = new NotificationService();
