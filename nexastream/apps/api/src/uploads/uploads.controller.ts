import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CloudinaryService } from './cloudinary.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Roles('ADMIN')
  @Post('panel-logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPanelLogo(@UploadedFile() file: Express.Multer.File) {
    const uploaded: any = await this.cloudinaryService.uploadBuffer(file.buffer, 'nexastream/panel');
    return { url: uploaded.secure_url, publicId: uploaded.public_id };
  }
}
