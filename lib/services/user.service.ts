import { UserRepository } from '@/lib/repositories/user.repository';

export class UserService {
  static async getProfile(userId: string) {
    return UserRepository.getProfileById(userId);
  }
}
