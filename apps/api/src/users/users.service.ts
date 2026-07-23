import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAccessDto } from './dto/update-user-access.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { UserType } from '@repo/types';

type UserUpdateOperations = {
  $set: Record<string, unknown>;
  $unset?: Record<string, ''>;
};

type ProfileEditableUserFields = Pick<
  UpdateUserDto,
  | 'givenName'
  | 'familyName'
  | 'type'
  | 'sex'
  | 'state'
  | 'dateOfBirth'
  | 'matricula'
  | 'division'
  | 'educationalProgram'
  | 'careerLevel'
  | 'employeeNumber'
>;

type AccessEditableUserFields = Pick<
  UpdateUserAccessDto,
  'role' | 'canValidateProjets' | 'canCloseProject'
>;

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private sanitizeProfileUpdatePayload(
    data: UpdateUserDto,
  ): Partial<ProfileEditableUserFields> {
    const safeData: Partial<ProfileEditableUserFields> = {};

    if (data.givenName !== undefined) safeData.givenName = data.givenName;
    if (data.familyName !== undefined) safeData.familyName = data.familyName;
    if (data.type !== undefined) safeData.type = data.type;
    if (data.sex !== undefined) safeData.sex = data.sex;
    if (data.state !== undefined) safeData.state = data.state;
    if (data.dateOfBirth !== undefined) safeData.dateOfBirth = data.dateOfBirth;
    if (data.matricula !== undefined) safeData.matricula = data.matricula;
    if (data.division !== undefined) safeData.division = data.division;
    if (data.educationalProgram !== undefined) {
      safeData.educationalProgram = data.educationalProgram;
    }
    if (data.careerLevel !== undefined) safeData.careerLevel = data.careerLevel;
    if (data.employeeNumber !== undefined) {
      safeData.employeeNumber = data.employeeNumber;
    }

    return safeData;
  }

  private sanitizeAccessUpdatePayload(
    data: UpdateUserAccessDto,
  ): Partial<AccessEditableUserFields> {
    const safeData: Partial<AccessEditableUserFields> = {};

    if (data.role !== undefined) safeData.role = data.role;
    if (data.canValidateProjets !== undefined) {
      safeData.canValidateProjets = data.canValidateProjets;
    }
    if (data.canCloseProject !== undefined) {
      safeData.canCloseProject = data.canCloseProject;
    }

    return safeData;
  }

  /**
   * Clears properties based on user type:
   * - ESTUDIANTE: clears employeeNumber
   * - MAESTRO/ADMINISTRATIVO: clears matricula and educationalProgram
   * Returns an object with $set and $unset operations for MongoDB
   */
  private clearPropertiesByUserType(
    data: Partial<ProfileEditableUserFields>,
  ): UserUpdateOperations {
    const fieldsToSet: Record<string, unknown> = { ...data };
    const fieldsToUnset: Record<string, ''> = {};

    if (data.type === UserType.ESTUDIANTE) {
      // Students shouldn't have employee number
      delete fieldsToSet.employeeNumber;
      fieldsToUnset.employeeNumber = '';
    } else if (
      data.type === UserType.MAESTRO ||
      data.type === UserType.ADMINISTRATIVO
    ) {
      // Teachers and administrative staff shouldn't have matricula or educational program
      delete fieldsToSet.matricula;
      delete fieldsToSet.educationalProgram;
      fieldsToUnset.matricula = '';
      fieldsToUnset.educationalProgram = '';
    }

    const result: UserUpdateOperations = { $set: fieldsToSet };
    if (Object.keys(fieldsToUnset).length > 0) {
      result.$unset = fieldsToUnset;
    }

    return result;
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ id: string; message: string }> {
    try {
      const createdUser = new this.userModel(createUserDto);
      await createdUser.save();
      return {
        id: createdUser._id.toString(),
        message: 'User created successfully',
      };
    } catch (err: any) {
      // Handle duplicate key or validation errors
      if (err.code === 11000) {
        throw new BadRequestException('User with this email already exists');
      }
      throw new BadRequestException(err.message);
    }
  }

  async createWithPassword({
    givenName,
    familyName,
    email,
    passwordHash,
    }: {
      givenName: string;
      familyName: string;
      email: string;
      passwordHash: string;
}) {
    try {
      const createdUser = new this.userModel({
        givenName,
        familyName,
        email,
        passwordHash,
      });

      await createdUser.save();
      return createdUser;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException('User with this email already exists');
      }
      throw new BadRequestException(err.message);
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel
      .find()
      .populate('division')
      .populate('educationalProgram')
      .exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .populate('division')
      .populate('educationalProgram')
      .exec();
    if (!user) throw new NotFoundException(`User with ID: ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email: email }).exec();
    return user || null;
  }

  async resolveEmails(emails: string[]) {
    const results = await Promise.all(
      emails.map(async (email) => {
        const user = await this.findByEmail(email);
        return { email, _id: user ? user._id.toString() : null, user };
      }),
    );

    return results;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ id: string; message: string }> {
    try {
      const safeProfilePayload = this.sanitizeProfileUpdatePayload(updateUserDto);

      // Clear properties based on user type
      // Use MongoDB operators to properly set and unset fields
      const updateOperations = this.clearPropertiesByUserType(safeProfilePayload);

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateOperations, { new: true })
        .exec();

      if (!updatedUser)
        throw new NotFoundException(`User with ID: ${id} not found`);

      return { id, message: 'User updated successfully' };
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException(
          'User with this matricula or employee number already exists',
        );
      }
      throw new BadRequestException(err.message);
    }
  }

  async updateAccess(
    id: string,
    updateUserAccessDto: UpdateUserAccessDto,
  ): Promise<{ id: string; message: string }> {
    const safeAccessPayload = this.sanitizeAccessUpdatePayload(updateUserAccessDto);

    if (Object.keys(safeAccessPayload).length === 0) {
      throw new BadRequestException('No access fields provided for update.');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: safeAccessPayload }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID: ${id} not found`);
    }

    return { id, message: 'User access updated successfully' };
  }

  async updateHashedRefreshToken(userId: string, hashedRefreshToken: string) {
    return await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          hashedRefreshToken,
        },
        { runValidators: true },
      )
      .exec();
  }
// This method is used when the user requests a password reset, to set the reset token and its expiration
  async setPasswordResetToken(
    userId: string,
    payload: {
      passwordResetTokenHash: string;
      passwordResetExpiresAt: Date;
    },
  ) {
    return await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          passwordResetTokenHash: payload.passwordResetTokenHash,
          passwordResetExpiresAt: payload.passwordResetExpiresAt,
          passwordResetUsedAt: null,
        },
        { runValidators: true },
      )
      .exec();
  }
// This method is used when the user successfully resets their password, to update the password hash and invalidate the reset token
  async completePasswordReset(
    userId: string,
    payload: {
      passwordHash: string;
      passwordResetUsedAt: Date;
    },
  ) {
    return await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          passwordHash: payload.passwordHash,
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
          passwordResetUsedAt: payload.passwordResetUsedAt,
        },
        { runValidators: true },
      )
      .exec();
  }

  async remove(id: string): Promise<{ id: string; message: string }> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser)
      throw new NotFoundException(`User with ID: ${id} not found`);

    return { id, message: 'User removed successfully' };
  }
}
