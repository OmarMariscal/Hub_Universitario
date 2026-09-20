import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import type { RegisterAcademicActivityDto } from '../../application/use-cases/register-academic-activity/register-academic-activity.use-case';
import { RegisterAcademicActivityUseCase } from '../../application/use-cases/register-academic-activity/register-academic-activity.use-case';

@Controller('activities')
export class AcademicActivityController {
  constructor(
    private readonly registerUseCase: RegisterAcademicActivityUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() body: RegisterAcademicActivityDto) {
    try {
      const dto: RegisterAcademicActivityDto = {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : body.dueDate,
      };
      const activity = await this.registerUseCase.execute(dto);
      return activity;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
