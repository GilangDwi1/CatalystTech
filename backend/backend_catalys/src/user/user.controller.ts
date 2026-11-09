import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles('admin')
  findAll(
    @Query('search') search?: string,
    @Query('is_active') isActive?: string,
  ) {
    return this.userService.findAll(search, isActive);
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Get('nip/:nip')
  @Roles('admin')
  findByNIP(@Param('nip') nip: string) {
    return this.userService.findByNIP(nip);
  }

  @Post()
  @Roles('admin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log('ID diterima:', id);
    console.log('Body diterima:', updateUserDto);
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}