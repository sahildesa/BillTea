import User from './models/User';

/**
 * Seeds a default admin user if no users exist in the database.
 * Credentials:
 *   Phone: 8180849725
 *   Email: admin@indux.com
 *   Password: pass@123
 */
export async function seedDefaultUser(): Promise<void> {
  try {
    const existingUser = await User.findOne({ phoneNumber: '8180849725' });
    if (existingUser) {
      console.log('✓ Default admin user already exists — skipping seed.');
      return;
    }

    await User.create({
      fullName: 'Indux Admin',
      phoneNumber: '8180849725',
      email: 'admin@indux.com',
      password: 'pass@123', // Will be hashed by pre-save hook
      profilePicture: '',
    });

    console.log('✓ Default admin user seeded successfully.');
    console.log('  Phone: 8180849725 | Email: admin@indux.com | Password: pass@123');
  } catch (error: any) {
    console.error('✗ Error seeding default user:', error.message);
  }
}
