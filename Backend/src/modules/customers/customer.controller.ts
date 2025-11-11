import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Auth } from '../../common/decorators/auth.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CreateCustomerDto } from './dto/request/create-customer.dto';
import { CustomerResponseDto } from './dto/response/customer-response.dto';
import { CustomerService } from './customer.service';
import { Customer } from './entities/customer.entity';

@ApiTags('Customers')
@ApiBearerAuth('Authorization')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @Auth(Role.ADMIN, Role.OWNER)
  @ApiOkResponse({ type: ApiResponseDto<Customer[]> })
  async findAll(): Promise<ApiResponseDto<Customer[]>> {
    const customers = await this.customerService.findAll();
    return new ApiResponseDto({
      success: true,
      message: 'Customers retrieved successfully.',
      data: customers,
    });
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.OWNER, Role.CUSTOMER)
  @ApiOkResponse({ type: ApiResponseDto<CustomerResponseDto> })
  async findOne(@Param('id') id: number): Promise<ApiResponseDto<CustomerResponseDto | null>> {
    const customer = await this.customerService.findOne(id);
    return new ApiResponseDto({
      success: true,
      message: 'Customer retrieved successfully.',
      data: customer ? plainToInstance(CustomerResponseDto, customer, { excludeExtraneousValues: true }) : null,
    });
  }

  @Post()
  @Auth(Role.ADMIN, Role.OWNER)
  @ApiOkResponse({ type: ApiResponseDto<CustomerResponseDto> })
  async create(@Body() dto: CreateCustomerDto): Promise<ApiResponseDto<CustomerResponseDto>> {
    const customer = await this.customerService.create(plainToInstance(Customer, dto, { excludeExtraneousValues: true }));
    return new ApiResponseDto({
      success: true,
      message: 'Customer created successfully.',
      data: plainToInstance(CustomerResponseDto, customer, { excludeExtraneousValues: true }),
    });
  }

  @Put(':id')
  @Auth(Role.ADMIN, Role.OWNER)
  @ApiOkResponse({ type: ApiResponseDto<CustomerResponseDto> })
  async update(
    @Param('id') id: number,
    @Body() dto: CreateCustomerDto,
  ): Promise<ApiResponseDto<CustomerResponseDto>> {
    const updatedCustomer = await this.customerService.update(
      id,
      plainToInstance(Customer, dto, { excludeExtraneousValues: true }),
    );
    return new ApiResponseDto({
      success: true,
      message: 'Customer updated successfully.',
      data: plainToInstance(CustomerResponseDto, updatedCustomer, { excludeExtraneousValues: true }),
    });
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  @ApiOkResponse({ type: ApiResponseDto<null> })
  async remove(@Param('id') id: number): Promise<ApiResponseDto<null>> {
    await this.customerService.remove(id);
    return new ApiResponseDto({
      success: true,
      message: 'Customer removed successfully.',
      data: null,
    });
  }
}
