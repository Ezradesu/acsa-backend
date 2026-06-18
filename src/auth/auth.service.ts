import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private email: EmailService,
    ) {}

    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) throw new ConflictException('Email already in use');

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const verificationToken = randomUUID();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

        const user = await this.prisma.user.create({
            data: {
                ...dto,
                password: hashedPassword,
                verification_token: verificationToken,
                verification_expires: verificationExpires,
            },
        });

        await this.email.sendVerificationEmail(user.email, verificationToken);

        const { password, verification_token, verification_expires, ...result } = user;
        return {
            ...result,
            message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) throw new UnauthorizedException('Invalid credentials');

        const passwordMatch = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

        if (!user.is_verified) {
            throw new UnauthorizedException(
                'Email belum diverifikasi. Silakan cek email Anda atau gunakan endpoint resend-verification.',
            );
        }

        const token = await this.jwt.signAsync({
            sub: user.id,
            email: user.email,
        });

        const { password, verification_token, verification_expires, ...result } = user;
        return { user: result, access_token: token };
    }

    async verifyEmail(token: string) {
        if (!token) throw new BadRequestException('Token tidak boleh kosong');

        const user = await this.prisma.user.findUnique({
            where: { verification_token: token },
        });

        if (!user) throw new NotFoundException('Token tidak valid atau sudah digunakan');

        if (user.verification_expires && user.verification_expires < new Date()) {
            throw new BadRequestException(
                'Token sudah expired. Silakan minta verifikasi ulang.',
            );
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                is_verified: true,
                verification_token: null,
                verification_expires: null,
            },
        });

        return { message: 'Email berhasil diverifikasi. Silakan login.' };
    }

    async resendVerification(email: string) {
        if (!email) throw new BadRequestException('Email tidak boleh kosong');

        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) throw new NotFoundException('User tidak ditemukan');
        if (user.is_verified) throw new BadRequestException('Email sudah terverifikasi');

        const verificationToken = randomUUID();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                verification_token: verificationToken,
                verification_expires: verificationExpires,
            },
        });

        await this.email.sendVerificationEmail(user.email, verificationToken);
        return { message: 'Email verifikasi telah dikirim ulang.' };
    }

    async me(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) throw new UnauthorizedException('User not found');

        const { password, verification_token, verification_expires, ...result } = user;
        return result;
    }

    async findAllUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                address: true,
                rt: true,
                rw: true,
                zip_code: true,
                role: true,
                is_verified: true,
                created_at: true,
                updated_at: true,
            },
        });
    }
}