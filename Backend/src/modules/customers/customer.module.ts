import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "./entities/customer.entity";
import { CustomerController } from "./customer.controller";
import { CustomerService } from "./customer.service";
import { Module } from "@nestjs/common";


@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
  providers: [CustomerService],
})


export class CustomerModule {}