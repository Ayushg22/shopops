import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { config } from '../config';
import { AuthTokens, UserProfile } from '@shopops/shared-types';

export class AuthService {
  async register(input: RegisterInput): Promise<AuthTokens> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      const err = new Error('User with this email already exists');
      (err as any).statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await userRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role as any
    });

    return this.generateAuthResponse(user);
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      const err = new Error('Invalid email or password');
      (err as any).statusCode = 401;
      throw err;
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      const err = new Error('Invalid email or password');
      (err as any).statusCode = 401;
      throw err;
    }

    return this.generateAuthResponse(user);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      (err as any).statusCode = 404;
      throw err;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any
    };
  }

  private generateAuthResponse(user: { id: string; email: string; name: string; role: string }): AuthTokens {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: config.jwtExpiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as any
      }
    };
  }
}

export const authService = new AuthService();
