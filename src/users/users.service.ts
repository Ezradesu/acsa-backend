import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../prisma/@prisma/client/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateUser(
    id: string,
    actorId: string,
    actorRole: string,
    dto: UpdateUserDto,
  ) {
    if (actorRole !== 'admin' && actorId !== id) {
      throw new ForbiddenException('You cannot update another user');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password: newPassword, ...profileData } = dto;
    const updateData: Prisma.UserUpdateInput = { ...profileData };

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return {
      id: updatedUser.id,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      address: updatedUser.address,
      rt: updatedUser.rt,
      rw: updatedUser.rw,
      zip_code: updatedUser.zip_code,
      email: updatedUser.email,
      role: updatedUser.role,
      is_verified: updatedUser.is_verified,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
    };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // ponytail: delete user directly, Cascade onDelete is handled on relations if defined
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted' };
  }
}
