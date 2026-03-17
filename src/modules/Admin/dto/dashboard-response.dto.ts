import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => ID)
  _id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  bannedAt?: Date;
}

@ObjectType()
export class CompanyType {
  @Field(() => ID)
  _id: string;

  @Field()
  companyName: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  bannedAt?: Date;

  @Field()
  isApproved: boolean;
}

@ObjectType()
export class DashboardResponse {
  @Field(() => [UserType])
  users: UserType[];

  @Field(() => [CompanyType])
  companies: CompanyType[];
}
