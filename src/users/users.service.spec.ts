import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(UsersService);
  });

  it('menolak pengguna biasa yang mengubah akun lain', async () => {
    await expect(
      service.updateUser('user-b', 'user-a', 'user', { first_name: 'B' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('mengizinkan pemilik akun mengubah profilnya', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-a',
      email: 'a@example.com',
      password: 'hash',
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-a',
      email: 'a@example.com',
      first_name: 'Baru',
      last_name: 'User',
      address: null,
      rt: null,
      rw: null,
      zip_code: null,
      role: 'user',
      is_verified: true,
      created_at: new Date('2026-09-09T00:00:00.000Z'),
      updated_at: new Date('2026-09-09T00:00:00.000Z'),
      password: 'hash',
    });

    await expect(
      service.updateUser('user-a', 'user-a', 'user', { first_name: 'Baru' }),
    ).resolves.toEqual({
      id: 'user-a',
      email: 'a@example.com',
      first_name: 'Baru',
      last_name: 'User',
      address: null,
      rt: null,
      rw: null,
      zip_code: null,
      role: 'user',
      is_verified: true,
      created_at: new Date('2026-09-09T00:00:00.000Z'),
      updated_at: new Date('2026-09-09T00:00:00.000Z'),
    });
  });

  it('tetap memberi not found ketika admin memilih ID yang tidak ada', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.updateUser('missing', 'admin-a', 'admin', {}),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
