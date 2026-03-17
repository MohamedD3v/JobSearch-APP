import { Controller, Patch, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles as RolesDecorator } from '../../common/decorators/roles.decorator';
import { Roles } from '../../common/enums/enums';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@RolesDecorator(Roles.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('users/:id/ban')
  async toggleUserBan(@Param('id') id: string) {
    return this.adminService.toggleUserBan(id);
  }

  @Patch('companies/:id/ban')
  async toggleCompanyBan(@Param('id') id: string) {
    return this.adminService.toggleCompanyBan(id);
  }

  @Patch('companies/:id/approve')
  async approveCompany(@Param('id') id: string) {
    return this.adminService.approveCompany(id);
  }
}
