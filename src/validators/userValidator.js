class UserValidator {
  _validateEmail(email) {
    if (!email || email.trim().length === 0) {
      return 'Email is required.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Email must be a valid format.';
    }
    return null;
  }

  _validatePassword(password, minLength = 6) {
    if (!password || password.length === 0) {
      return 'Password is required.';
    }
    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    return null;
  }

  _validatePhone(phone) {
    if (!phone || phone.trim().length === 0) {
      return 'Phone number is required.';
    }
    const localPattern = /^0\d{9}$/;
    const internationalPattern = /^\+27\d{9}$/;
    if (!localPattern.test(phone) && !internationalPattern.test(phone)) {
      return 'Phone must be a valid South African number: 10 digits starting with 0 or +27 followed by 9 digits.';
    }
    return null;
  }

  _validateAddress(address) {
    if (address && address.trim().length > 0) {
      if (address.trim().length < 5) {
        return 'Address must be at least 5 characters long.';
      }
    }
    return null;
  }

  _validateLat(lat) {
    if (!lat) {
      return 'Latitude is required.';
    }
    const latNum = parseFloat(lat);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      return 'Latitude must be a number between -90 and 90.';
    }
    return null;
  }

  _validateLng(lng) {
    if (!lng) {
      return 'Longitude is required.';
    }
    const lngNum = parseFloat(lng);
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      return 'Longitude must be a number between -180 and 180.';
    }
    return null;
  }

  validate(body, context = 'register') {
    const errors = [];

    // Always validate email
    const emailError = this._validateEmail(body.email);
    if (emailError) errors.push(emailError);

    let passwordMin = 6; // Default
    let phoneError = null;

    switch (context) {
      case 'register':
        // Strict password for new users
        passwordMin = 6;
        // Registration-specific validations
        if (!body.first_name || body.first_name.trim().length === 0) {
          errors.push('First name is required.');
        }
        if (!body.last_name || body.last_name.trim().length === 0) {
          errors.push('Last name is required.');
        }
        phoneError = this._validatePhone(body.phone);
        if (phoneError) errors.push(phoneError);

        const addressError = this._validateAddress(body.address);
        if (addressError) errors.push(addressError);

        const latError = this._validateLat(body.lat);
        if (latError) errors.push(latError);

        const lngError = this._validateLng(body.lng);
        if (lngError) errors.push(lngError);
        break;

      case 'login':
        // Minimal for existing users
        passwordMin = 1;
        // Login-specific: No additional fields required
        break;

      default:
        // Unknown context: Warn and default to register rules
        errors.push(`Unknown validation context: ${context}. Using register rules.`);
        passwordMin = 6;
        // Apply register validations as fallback
        if (!body.first_name || body.first_name.trim().length === 0) {
          errors.push('First name is required.');
        }
        if (!body.last_name || body.last_name.trim().length === 0) {
          errors.push('Last name is required.');
        }
        phoneError = this._validatePhone(body.phone);
        if (phoneError) errors.push(phoneError);
    }

    // Validate password after determining min length
    const passwordError = this._validatePassword(body.password, passwordMin);
    if (passwordError) errors.push(passwordError);

    return errors;
  }
}

module.exports = UserValidator;