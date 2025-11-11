import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiBearerAuth('Authorization')
  @Auth(Role.OWNER, Role.ADMIN)
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Get()
  @ApiBearerAuth('Authorization')
  @Auth(Role.ADMIN)
  findAll() {
    return this.postsService.findAll();
  }

  @Get('public')
  @ApiExcludeEndpoint()
  findPublic() {
    return this.postsService.findPublic();
  }

  @Get('public/:id')
  @ApiExcludeEndpoint()
  findOnePublic(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOnePublic(id);
  }

  @Get('spa/:spaId')
  @ApiExcludeEndpoint()
  findBySpa(@Param('spaId', ParseIntPipe) spaId: number) {
    return this.postsService.findBySpa(spaId);
  }

  @Get(':id')
  @ApiBearerAuth('Authorization')
  @Auth(Role.OWNER, Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('Authorization')
  @Auth(Role.OWNER, Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('Authorization')
  @Auth(Role.OWNER, Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}

