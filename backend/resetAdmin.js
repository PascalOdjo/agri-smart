import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

async function resetAdmin() {
  try {
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (admin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await admin.update({ passwordHash });
      console.log(`Admin email: ${admin.email}`);
      console.log('Password reset to: admin123');
    } else {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const newAdmin = await User.create({
        email: 'admin@agrismart.tg',
        passwordHash,
        fullName: 'Super Admin',
        role: 'admin'
      });
      console.log(`Created new admin email: ${newAdmin.email}`);
      console.log('Password set to: admin123');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
resetAdmin();
