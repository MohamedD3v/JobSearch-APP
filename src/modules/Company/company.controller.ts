import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createCompanyDto: CreateCompanyDto, @Req() req: any) {
    return this.companyService.createCompany(
      createCompanyDto,
      req.user._id as string,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Req() req: any,
  ) {
    return this.companyService.updateCompany(
      id,
      updateCompanyDto,
      req.user._id as string,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseMongoIdPipe) id: string, @Req() req: any) {
    return this.companyService.softDeleteCompany(
      id,
      req.user._id as string,
      req.user.role as string,
    );
  }

  @Get('search')
  search(@Query('name') name: string) {
    return this.companyService.searchCompany(name);
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.companyService.getCompanyWithJobs(id);
  }

  @Post(':id/logo')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('logo'))
  uploadLogo(
    @Param('id', ParseMongoIdPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.companyService.uploadLogo(id, req.user._id as string, file);
  }

  @Delete(':id/logo')
  @UseGuards(AuthGuard)
  deleteLogo(@Param('id', ParseMongoIdPipe) id: string, @Req() req: any) {
    return this.companyService.deleteLogo(id, req.user._id as string);
  }

  @Post(':id/cover')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('cover'))
  uploadCover(
    @Param('id', ParseMongoIdPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.companyService.uploadCover(id, req.user._id as string, file);
  }

  @Delete(':id/cover')
  @UseGuards(AuthGuard)
  deleteCover(@Param('id', ParseMongoIdPipe) id: string, @Req() req: any) {
    return this.companyService.deleteCover(id, req.user._id as string);
  }
}
