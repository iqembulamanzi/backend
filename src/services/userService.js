const User = require('../models/User');

class UserService {
  async createUser(userData) {
    // Check for existing user
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('A user with this email already exists.');
    }

    // Generate incremental userId (e.g., USER001, USER002)
    const latestUser = await User.findOne().sort({ userId: -1 });
    let nextNumber = 1;
    if (latestUser && latestUser.userId) {
      const match = latestUser.userId.match(/USER(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const userId = `USER${nextNumber.toString().padStart(3, '0')}`;

    // Create and save new user
    const newUser = new User({
      userId,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role || 'Guardian',
      password: userData.password
      // createdAt defaults to Date.now
    });

    const savedUser = await newUser.save();

    // Verify persistence
    const verifiedUser = await User.findById(savedUser._id);
    if (!verifiedUser) {
      throw new Error('Failed to verify saved user.');
    }

    return {
      savedUser,
      verifiedUser,
      role: savedUser.role
    };
  }
}

module.exports = UserService;