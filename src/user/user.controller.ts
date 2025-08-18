import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  FindAllUsersSwagger,
  FindOneUserSwagger,
  RemoveUserSwagger,
  RestorePasswordSwagger,
  UpdateUserSwagger,
} from './user.swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UpdateUserParamsDto } from './dto/update-user-params.dto';
import { RestorePasswordDto } from './dto/restore-password.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { DeleteUserParamsDto } from './dto/delete-user-params.dto';

@ApiTags('user')
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @FindAllUsersSwagger()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @FindOneUserSwagger()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOne({ where: { id } });
    return user;
  }

  @Patch('restore-password')
  @RestorePasswordSwagger()
  restorePassword(
    @CurrentUser() user: User,
    @Body() restorePasswordDto: RestorePasswordDto,
  ) {
    return this.userService.restorePassword(
      user.id,
      restorePasswordDto.oldPassword,
      restorePasswordDto.newPassword,
    );
  }

  @Patch(':id')
  @UpdateUserSwagger()
  update(
    @Param() params: UpdateUserParamsDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(params.id, updateUserDto);
  }

  @Delete(':id')
  @RemoveUserSwagger()
  remove(@Param() params: DeleteUserParamsDto) {
    return this.userService.remove(params.id);
  }
}
