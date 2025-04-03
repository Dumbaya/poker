import { Controller, Post, Body } from '@nestjs/common';

@Controller('login')
export class LoginController {
    @Post('login')
    login(@Body() body:{ id: string; password: string; }) {
        const { id, password } = body;

        return { success: true, data: { id, password } };
    }
}
