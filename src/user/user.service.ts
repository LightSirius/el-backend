import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { encodePassword } from '../utils/bcrypt';
import { Connection, EntityManager, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { User } from './entities/user.entity';
import { AuthType, UserAuth } from './entities/user-auth.entity';

import { UserRegistrationDto } from './dto/user-registration.dto';
import { UserModifyPasswordDto } from './dto/user-modify-password.dto';
import { UserModifyInfoDto } from './dto/user-modify-info.dto';
import { UserAuthLocal } from './entities/user-auth-local.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CreateUserResponseDto,
  Status as CreateUserStatus,
} from './dto/create-user.response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAuth)
    private authRepository: Repository<UserAuth>,
    @InjectRepository(UserAuthLocal)
    private authLocalRepository: Repository<UserAuthLocal>,

    private readonly configService: ConfigService,
    private readonly entityManager: EntityManager,
    private readonly connection: Connection,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    const queryRunner = this.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const userAuth = new UserAuth({ auth_type: createUserDto.auth_type });

      switch (userAuth.auth_type) {
        case AuthType.Local: {
          createUserDto.userAuthLocal.auth_password = await encodePassword(
            createUserDto.userAuthLocal.auth_password,
          );

          const authLocal = new UserAuthLocal({
            userAuth: userAuth,
            ...createUserDto.userAuthLocal,
          });
          if (!(await this.authLocalDuplicateIdValidate(authLocal.auth_id))) {
            Logger.error('user_create: local auth id duplicated');
            return { status: CreateUserStatus.id_duplicated };
          }
          const user = new User({
            ...createUserDto,
            userAuth,
          });

          if (!(await queryRunner.manager.save(authLocal))) {
            Logger.error('user_create: auth local not gen');
            await queryRunner.rollbackTransaction();
            return { status: CreateUserStatus.auth_not_created };
          }
          if (!(await queryRunner.manager.save(user))) {
            Logger.error('user_create: user not gen');
            await queryRunner.rollbackTransaction();
            return { status: CreateUserStatus.user_not_created };
          }

          await queryRunner.commitTransaction();
          return {
            status: CreateUserStatus.created,
            user_uuid: user.user_uuid,
          };
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(user_uuid: string): Promise<User> {
    return this.userRepository.findOneBy({ user_uuid });
  }

  async findOneWithAuth(user_uuid: string): Promise<User> {
    return this.userRepository.findOne({
      where: { user_uuid },
      relations: { userAuth: true },
    });
  }

  async update(user_uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ user_uuid });
    user.user_name = updateUserDto.user_name
      ? updateUserDto.user_name
      : user.user_name;
    user.user_email = updateUserDto.user_email
      ? updateUserDto.user_email
      : user.user_email;
    user.user_born = updateUserDto.user_born
      ? updateUserDto.user_born
      : user.user_born;
    user.user_gender = updateUserDto.user_gender
      ? updateUserDto.user_gender
      : user.user_gender;
    return await this.entityManager.save(user);
  }

  async remove(user_uuid: string): Promise<DeleteResult> {
    const user = await this.findOneWithAuth(user_uuid);
    return this.authRepository.delete(user.userAuth.uuid);
  }

  async authLocalDuplicateIdValidate(auth_id: string): Promise<boolean> {
    const authLocal = await this.authLocalRepository.findOneBy({
      auth_id: auth_id,
    });
    return !authLocal;
  }

  async authFindLocalToId(auth_id: string): Promise<UserAuthLocal> {
    return this.authLocalRepository.findOne({
      relations: { userAuth: true },
      where: {
        auth_id: auth_id,
      },
    });
  }
}
