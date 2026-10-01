import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RegisterCourseUseCase } from '../../application/use-cases/register-course.use-case';
import { CreateCourseDto } from '../dtos/create-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly registerCourseUseCase: RegisterCourseUseCase) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async registerCourse(@Body() dto: CreateCourseDto, @Request() req: any) {
    const userId: string = req.user.sub;
    return this.registerCourseUseCase.execute({ ...dto, userId });
  }
}
