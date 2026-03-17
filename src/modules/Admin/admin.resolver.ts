import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DashboardResponse } from './dto/dashboard-response.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles as RolesDecorator } from '../../common/decorators/roles.decorator';
import { Roles } from '../../common/enums/enums';

@Resolver()
@UseGuards(AuthGuard, RolesGuard)
@RolesDecorator(Roles.ADMIN)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => DashboardResponse)
  async getDashboardData() {
    return this.adminService.getDashboardData();
  }
}
