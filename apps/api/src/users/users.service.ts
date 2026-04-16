import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { UserType } from '@repo/types';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  /**
   * Clears properties based on user type:
   * - ESTUDIANTE: clears employeeNumber
   * - MAESTRO/ADMINISTRATIVO: clears matricula and educationalProgram
   * Returns an object with $set and $unset operations for MongoDB
   */
  private clearPropertiesByUserType(data: any): { $set: any; $unset?: any } {
    const fieldsToSet = { ...data };
    const fieldsToUnset: any = {};

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

    const result: { $set: any; $unset?: any } = { $set: fieldsToSet };
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
      // Clear properties based on user type
      // Use MongoDB operators to properly set and unset fields
      const updateOperations = this.clearPropertiesByUserType(updateUserDto);

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

  async remove(id: string): Promise<{ id: string; message: string }> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser)
      throw new NotFoundException(`User with ID: ${id} not found`);

    return { id, message: 'User removed successfully' };
  }
}
