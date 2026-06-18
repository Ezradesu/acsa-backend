import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorators';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    /**
     * GET /auth/verify-email?token=<token>
     * Endpoint publik — dipanggil dari link di email verifikasi.
     */
    @Get('verify-email')
    @HttpCode(HttpStatus.OK)
    verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    /**
     * POST /auth/resend-verification
     * Body: { "email": "user@example.com" }
     * Kirim ulang email verifikasi jika token expired atau belum diterima.
     */
    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    resendVerification(@Body('email') email: string) {
        return this.authService.resendVerification(email);
    }

    @UseGuards(JwtGuard)
    @Get('me')
    me(@GetUser('id') userId: string) {
        return this.authService.me(userId);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles('admin')
    @Get('users')
    findAllUsers() {
        return this.authService.findAllUsers();
    }
}