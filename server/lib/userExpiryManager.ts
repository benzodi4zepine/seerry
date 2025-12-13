import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import PreparedEmail from '@server/lib/email';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import path from 'path';
import { Between, LessThan } from 'typeorm';

class UserExpiryManager {
  public running = false;

  /**
   * Check for users expiring in 3 days and send warning emails
   */
  async checkExpiringUsers(): Promise<void> {
    const settings = getSettings();
    const userRepository = getRepository(User);

    try {
      logger.info('Starting expiry warning check...', {
        label: 'User Expiry Manager',
      });

      // Calculate 3 days from now
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(now.getDate() + 3);

      // Find users expiring within the next 3 days
      const expiringUsers = await userRepository.find({
        where: {
          expiryDate: Between(now, threeDaysFromNow),
        },
      });

      logger.info(
        `Found ${expiringUsers.length} user(s) expiring within 3 days`,
        {
          label: 'User Expiry Manager',
        }
      );

      // Send warning email to each expiring user
      for (const user of expiringUsers) {
        // Skip owner user (ID 1)
        if (user.id === 1) {
          continue;
        }

        try {
          const daysRemaining = Math.ceil(
            (user.expiryDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          logger.info(`Sending expiry warning to user ${user.email}`, {
            label: 'User Expiry Manager',
            userId: user.id,
            expiryDate: user.expiryDate,
            daysRemaining,
          });

          if (settings.notifications.agents.email.enabled) {
            const email = new PreparedEmail(
              settings.notifications.agents.email
            );
            await email.send({
              template: path.join(
                __dirname,
                '../templates/email/expirywarning'
              ),
              message: {
                to: user.email,
              },
              locals: {
                recipientName: user.displayName,
                recipientEmail: user.email,
                expiryDate: user.expiryDate!.toLocaleDateString(),
                daysRemaining,
                applicationTitle: settings.main.applicationTitle,
                applicationUrl: settings.main.applicationUrl,
              },
            });
          }
        } catch (error) {
          logger.error('Failed to send expiry warning email', {
            label: 'User Expiry Manager',
            userId: user.id,
            errorMessage: error.message,
          });
        }
      }

      logger.info('Expiry warning check completed', {
        label: 'User Expiry Manager',
      });
    } catch (error) {
      logger.error('Error during expiry warning check', {
        label: 'User Expiry Manager',
        errorMessage: error.message,
      });
    }
  }

  /**
   * Find expired users and disable their accounts
   */
  async disableExpiredUsers(): Promise<void> {
    const userRepository = getRepository(User);

    try {
      logger.info('Starting expired user check...', {
        label: 'User Expiry Manager',
      });

      const now = new Date();

      // Find users whose expiry date has passed
      const expiredUsers = await userRepository.find({
        where: {
          expiryDate: LessThan(now),
        },
      });

      // Filter out users who already have no permissions (already disabled)
      const usersToDisable = expiredUsers.filter(
        (user) => user.permissions !== 0 && user.id !== 1 // Never disable owner
      );

      logger.info(`Found ${usersToDisable.length} expired user(s) to disable`, {
        label: 'User Expiry Manager',
      });

      // Disable each expired user by setting permissions to 0
      for (const user of usersToDisable) {
        try {
          logger.info(`Disabling expired user ${user.email}`, {
            label: 'User Expiry Manager',
            userId: user.id,
            expiryDate: user.expiryDate,
          });

          user.permissions = 0;
          await userRepository.save(user);

          logger.info(`Successfully disabled user ${user.email}`, {
            label: 'User Expiry Manager',
            userId: user.id,
          });
        } catch (error) {
          logger.error('Failed to disable expired user', {
            label: 'User Expiry Manager',
            userId: user.id,
            errorMessage: error.message,
          });
        }
      }

      logger.info('Expired user check completed', {
        label: 'User Expiry Manager',
      });
    } catch (error) {
      logger.error('Error during expired user check', {
        label: 'User Expiry Manager',
        errorMessage: error.message,
      });
    }
  }
}

const userExpiryManager = new UserExpiryManager();
export default userExpiryManager;
