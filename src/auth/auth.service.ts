import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { comparePassword } from '../utils/bcrypt';
import { UserAuth } from '../user/entities/user-auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateLocal(
    auth_id: string,
    auth_password: string,
  ): Promise<UserAuth | null> {
    const auth = await this.userService.authFindLocalToId(auth_id);
    if (auth && (await comparePassword(auth_password, auth.auth_password))) {
      return auth.userAuth;
    }
    return null;
  }

  async login(auth: UserAuth): Promise<{ access_token: string }> {
    const user: User = await this.userService.findOneToAuth(auth);
    const payload = {
      uuid: user.user_uuid,
      name: user.user_name,
      email: user.user_email,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
