const UserValidator = require('../validators/userValidator');
const UserService = require('../services/userService');
const validator = new UserValidator();
const userService = new UserService();

exports.submitUser = async (req, res) => {
  console.log('Received submit request with status 200 (initial):', req.method, req.url); // Log request arrival
  try {
    const errors = validator.validate(req.body, 'register');
    if (errors.length > 0) {
      console.log('Validation failed with status 400:', errors); // Log validation failure
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }
    const { first_name, last_name, email, phone, password, role } = req.body;
    const userData = { first_name, last_name, email, phone, password, role };
    const serviceResult = await userService.createUser(userData);
    console.log('User created successfully with status 201:', { id: serviceResult.savedUser._id, role: serviceResult.role, email: req.body.email }); // Log success
    res.status(201).json({ success: true, message: `Welcome, ${first_name}! Your account has been created with role: ${serviceResult.role}.` });
  } catch (error) {
    console.error('Error in submitUser with status 500:', error.message); // Log general errors
    if (error.message.includes('already exists')) {
      console.log('Duplicate email with status 400:', req.body.email);
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }
    res.status(500).json({ success: false, message: 'Error saving user data: ' + error.message });
  }
};

exports.getUsers = async (req, res) => {
  console.log('Received get users request with status 200 (initial):', req.method, req.url); // Log users fetch
  try {
    const users = await User.find({}, { password: 0, __v: 0 });
    console.log(`Fetched ${users.length} users with status 200`); // Log fetch success
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users with status 500:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching users: ' + error.message });
  }
};

exports.loginUser = async (req, res) => {
  console.log('Received login request with status 200 (initial):', req.method, req.url, { email: req.body.email }); // Log login request
  try {
    const errors = validator.validate(req.body, 'login');
    if (errors.length > 0) {
      console.log('Login validation failed with status 400:', errors);
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }
    const { email, password } = req.body;
    // Basic check - in real app, use bcrypt.compare and JWT
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      console.log('Invalid login attempt with status 401 for email:', req.body.email); // Log failed login
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    console.log('Login successful with status 200 for email:', req.body.email); // Log successful login
    res.status(200).json({ success: true, message: 'Login successful.', user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Error in loginUser with status 500:', error.message);
    res.status(500).json({ success: false, message: 'Error during login: ' + error.message });
  }
};