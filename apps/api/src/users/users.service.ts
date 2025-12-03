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

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (err: any) {
      // Handle duplicate key or validation errors
      if (err.code === 11000) {
        throw new BadRequestException(
          'User with this email, matricula, or employee number already exists',
        );
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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();

      if (!updatedUser)
        throw new NotFoundException(`User with ID: ${id} not found`);

      return updatedUser;
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

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser)
      throw new NotFoundException(`User with ID: ${id} not found`);

    return deletedUser;
  }
}
